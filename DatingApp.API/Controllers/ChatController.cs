using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/chat")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IChatRepository chatRepository;
        private readonly IDatingRepository datingRepository;
        private readonly IMapper mapper;

        public ChatController(IChatRepository chatRepository, IDatingRepository datingRepository, IMapper mapper)
        {
            this.chatRepository = chatRepository;
            this.datingRepository = datingRepository;
            this.mapper = mapper;
        }

        [HttpGet("thread/{threadId}", Name = "GetMessageThread")]
        public async Task<IActionResult> GetMessageThread(int userId, string threadId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var messageThread = await chatRepository.GetMessageThread(ObjectId.Parse(threadId));
            if ( userId != messageThread.ParticipantOne && userId != messageThread.ParticipantTwo )
            {
                return Unauthorized();
            }
            var anotherParticipantId = userId == messageThread.ParticipantOne? 
                messageThread.ParticipantTwo: messageThread.ParticipantOne;
            var anotherParticipant = mapper.Map<UserForListDto>(await datingRepository.GetUser(anotherParticipantId));
            var unreadMessageCount = userId == messageThread.ParticipantOne? 
                messageThread.ParticipantTwoUnreadMessageCount: messageThread.ParticipantOneUnreadMessageCount;
            var messageThreadToReturn = mapper.Map<MessageThreadForReturnDto>(
                messageThread,
                option => {
                    option.Items["AnotherParticipant"] = anotherParticipant;
                    option.Items["UnreadMessageCount"] = unreadMessageCount;
                });
            return Ok(messageThreadToReturn);
        }

        [HttpGet("thread/{threadId}/messages")]
        public async Task<IActionResult> GetMessagesForThread(int userId, string threadId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var messageThread = await chatRepository.GetMessageThread(ObjectId.Parse(threadId));
            if ( userId != messageThread.ParticipantOne && userId != messageThread.ParticipantTwo )
            {
                return Unauthorized();
            }
            return Ok(messageThread.Messages);
        }

        [HttpGet("thread")]
        public async Task<IActionResult> GetMessageThreadsForUser(int userId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var messageThreads = await chatRepository.GetMessageThreadsOfUser(userId);
            var otherParticipantIds = new Dictionary<string, int>();
            messageThreads.ForEach(thread => {
                if (userId == thread.ParticipantOne)
                {
                    otherParticipantIds.TryAdd(thread.Id.ToString(), thread.ParticipantTwo);
                }
                else
                {
                    otherParticipantIds.TryAdd(thread.Id.ToString(), thread.ParticipantOne);
                }
            });
            var unreadMessageCounts = new Dictionary<string, int>();
            messageThreads.ForEach(thread => {
                if (userId == thread.ParticipantOne)
                {
                    unreadMessageCounts.TryAdd(thread.Id.ToString(), thread.ParticipantOneUnreadMessageCount);
                }
                else
                {
                    unreadMessageCounts.TryAdd(thread.Id.ToString(), thread.ParticipantTwoUnreadMessageCount);
                }
            });
            var otherParticipantsList = mapper.Map<List<UserForListDto>>(await datingRepository.GetUsers(otherParticipantIds.Values.ToList()));
            var otherParticipants = new Dictionary<int, UserForListDto>();
            otherParticipantsList.ForEach(participant => {
                otherParticipants.Add(participant.Id, participant);
            });
            var messageThreadsToReturn = messageThreads.Select((thread, index) => 
                mapper.Map<MessageThreadForReturnDto>(
                    thread,
                    option => {
                        option.Items["AnotherParticipant"] = otherParticipants.GetValueOrDefault(otherParticipantIds.GetValueOrDefault(thread.Id.ToString()));
                        option.Items["UnreadMessageCount"] = unreadMessageCounts.GetValueOrDefault(thread.Id.ToString());
                    }
                )).ToList();
            return Ok(messageThreadsToReturn);
        }

        [HttpPost("thread")]
        public async Task<IActionResult> CreateMessageThread(int userId,
            [FromBody]CreateMessageThreadParams createMessageThreadParams)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var anotherParticipantId = createMessageThreadParams.anotherParticipantId;
            var anotherParticipantTask = datingRepository.GetUser(anotherParticipantId);
            if (userId == anotherParticipantId)
            {
                return BadRequest("Cannot create message thread with yourself.");
            }
            var anotherParticipant = await anotherParticipantTask;
            if (anotherParticipant == null)
            {
                return BadRequest("Unable to start conversation with user doesn't exist.");
            }
            var isUserParticipantOne = userId < anotherParticipantId;
            var participantOneId = isUserParticipantOne? userId : anotherParticipantId;
            var participantTwoId = isUserParticipantOne? anotherParticipantId : userId;
            var newMessageThread = new MessageThread()
            {
                ParticipantOne = participantOneId,
                ParticipantTwo = participantTwoId,
                VisibleToParticipantOne = isUserParticipantOne,
                VisibleToParticipantTwo = !isUserParticipantOne
            };
            await chatRepository.CreateNewMessageThread(newMessageThread);
            var messageThreadToReturn = mapper.Map<MessageThreadForReturnDto>(
                newMessageThread,
                option => {
                    option.Items["AnotherParticipant"] = mapper.Map<UserForListDto>(anotherParticipant);
                    option.Items["UnreadMessageCount"] = 0;
                });
            return CreatedAtRoute(
                "GetMessageThread",
                new { threadId = newMessageThread.Id.ToString() },
                messageThreadToReturn);
        }
    }    
}