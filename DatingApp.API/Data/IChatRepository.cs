using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Models;
using MongoDB.Bson;

namespace DatingApp.API.Data
{
    public interface IChatRepository
    {
        Task AddMessageToThread(Message message, ObjectId threadId, bool isRecipientFocusingOnThisConversation);
        Task CreateNewMessageThread(MessageThread messageThread);
        Task<List<MessageThread>> GetMessageThreadsOfUser(int userId);
        Task<MessageThread> GetMessageThread(ObjectId threadId);
        Task MarkThreadAsRead(ObjectId threadId, int userId, int anotherParticipantId);
    }
}