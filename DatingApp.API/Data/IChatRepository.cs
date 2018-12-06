using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Models;
using MongoDB.Bson;

namespace DatingApp.API.Data
{
    public interface IChatRepository
    {
        Task AddMessageToThread(Message message, ObjectId threadId);
        Task CreateNewMessageThread(int participantOneId, int participantTwoId, bool isCurrentUserParticipantOne);
        Task<List<MessageThread>> GetMessageThreadsOfUser(int userId);
        Task<MessageThread> GetMessageThread(ObjectId threadId);
        Task MarkThreadAsRead(ObjectId threadId, int userId, int anotherParticipantId);
    }
}