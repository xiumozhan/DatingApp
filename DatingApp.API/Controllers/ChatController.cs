using System;
using System.Collections.Generic;
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
        private readonly IChatRepository repository;
        private readonly IMapper mapper;

        public ChatController(IChatRepository repository, IMapper mapper)
        {
            this.repository = repository;
            this.mapper = mapper;
        }

        [HttpGet("thread/{threadId}", Name = "GetMessageThread")]
        public async Task<IActionResult> GetMessageThread(int userId, string threadId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var messageThread = await repository.GetMessageThread(ObjectId.Parse(threadId));
            if ( userId != messageThread.ParticipantOne && userId != messageThread.ParticipantTwo )
            {
                return Unauthorized();
            }
            var messageThreadToReturn = mapper.Map<MessageThreadForReturnDto>(
                messageThread,
                option => option.Items["UserRequestingIt"] = userId);
            return Ok(messageThreadToReturn);
        }

        [HttpGet("thread/{threadId}/messages")]
        public async Task<IActionResult> GetMessagesForThread(int userId, string threadId)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }
            var messageThread = await repository.GetMessageThread(ObjectId.Parse(threadId));
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
            var messageThreads = await repository.GetMessageThreadsOfUser(userId);
            var messageThreadsToReturn = mapper.Map<List<MessageThreadForReturnDto>>(
                messageThreads,
                option => option.Items["UserRequestingIt"] = userId);
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
            if (userId == anotherParticipantId)
            {
                return BadRequest("Cannot create message thread with yourself.");
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
            await repository.CreateNewMessageThread(newMessageThread);
            var messageThreadToReturn = mapper.Map<MessageThreadForReturnDto>(
                newMessageThread,
                option => option.Items["UserRequestingIt"] = userId);
            return CreatedAtRoute(
                "GetMessageThread",
                new { threadId = newMessageThread.Id.ToString() },
                messageThreadToReturn);
        }
    }    
}