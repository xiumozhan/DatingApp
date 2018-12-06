using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DatingApp.API.Data
{
    public class ChatRepository : IChatRepository
    {
        private readonly ChatMessageContext context;

        public ChatRepository(ChatMessageContext context)
        {
            this.context = context;
        }

        public async Task AddMessageToThread(Message message, ObjectId threadId)
        {
            await context.MessageThreads.UpdateOneAsync(
                thread => thread.Id.Equals(threadId),
                new UpdateDefinitionBuilder<MessageThread>()
                    .Push(thread => thread.Messages, message)
                    .Set(thread => thread.VisibleToParticipantOne, true)
                    .Set(thread => thread.VisibleToParticipantTwo, true));
        }

        public async Task CreateNewMessageThread(int participantOneId, int participantTwoId,
            bool isCurrentUserParticipantOne)
        {
            await context.MessageThreads.InsertOneAsync(new MessageThread()
            {
                ParticipantOne = participantOneId,
                ParticipantTwo = participantTwoId,
                VisibleToParticipantOne = isCurrentUserParticipantOne,
                VisibleToParticipantTwo = !isCurrentUserParticipantOne
            });
        }

        public async Task<MessageThread> GetMessageThread(ObjectId threadId)
        {
            var messageThread = await context.MessageThreads
                .Find(thread => thread.Id.Equals(threadId)).Limit(1).SingleAsync();
            return messageThread;
        }

        public async Task<List<MessageThread>> GetMessageThreadsOfUser(int userId)
        {
            return await context.MessageThreads
                .FindSync(thread => isThreadVisibleToUser(thread, userId))
                .ToListAsync();
        }

        public async Task MarkThreadAsRead(ObjectId threadId, int userId, int anotherParticipantId)
        {
            UpdateDefinition<MessageThread> updateOperation;
            if (userId > anotherParticipantId)
            {
                updateOperation = new UpdateDefinitionBuilder<MessageThread>()
                    .Set(thread => thread.ParticipantTwoUnreadMessageCount, 0);
            }
            else
            {
                updateOperation = new UpdateDefinitionBuilder<MessageThread>()
                    .Set(thread => thread.ParticipantOneUnreadMessageCount, 0);
            }
            await context.MessageThreads.UpdateOneAsync(
                thread => thread.Id.Equals(threadId),
                updateOperation,
                new UpdateOptions()
                {
                    IsUpsert = true
                });
        }

        private bool isThreadVisibleToUser(MessageThread thread, int userId)
        {
            return (thread.ParticipantOne == userId && thread.VisibleToParticipantOne) ||
                (thread.ParticipantTwo == userId && thread.VisibleToParticipantTwo);
        }
    }
}