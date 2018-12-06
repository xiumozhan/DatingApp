using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
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

        [HttpGet("thread/{threadId}")]
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
            return Ok(messageThreads);
        }
    }
}