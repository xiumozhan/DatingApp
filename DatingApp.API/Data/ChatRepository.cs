using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DatingApp.API.Data
{
    public class ChatRepository : IChatRepository
    {
        private readonly ChatMessageContext context;

        public ChatRepository(IOptions<MongoDbSettings> options)
        {
            this.context = new ChatMessageContext(options);
        }

        public async Task AddMessageToThread(Message message, ObjectId threadId, bool isRecipientFocusingOnThisConversation)
        {
            var updateDefinition = new UpdateDefinitionBuilder<MessageThread>()
                .Push(thread => thread.Messages, message)
                .Set(thread => thread.VisibleToParticipantOne, true)
                .Set(thread => thread.VisibleToParticipantTwo, true);
            if (!isRecipientFocusingOnThisConversation)
            {
                if (message.SenderId > message.RecipientId)
                {
                    updateDefinition = updateDefinition.Inc(thread => thread.ParticipantOneUnreadMessageCount, 1);
                }
                else
                {
                    updateDefinition = updateDefinition.Inc(thread => thread.ParticipantTwoUnreadMessageCount, 1);
                }
            }
            await context.MessageThreads.UpdateOneAsync(
                thread => thread.Id.Equals(threadId),
                updateDefinition);
        }

        public async Task CreateNewMessageThread(MessageThread messageThread)
        {
            await context.MessageThreads.InsertOneAsync(messageThread);
        }

        public async Task<MessageThread> GetMessageThread(ObjectId threadId)
        {
            var messageThread = await context.MessageThreads
                .Find(thread => thread.Id.Equals(threadId)).Limit(1).SingleAsync();
            return messageThread;
        }

        public async Task<MessageThread> GetMessageThread(int participantOneId, int participantTwoId, bool isUserParticipantOne)
        {
            UpdateDefinition<MessageThread> updateDefinition;
            if (isUserParticipantOne)
            {
                updateDefinition = new UpdateDefinitionBuilder<MessageThread>().Set(thread => thread.VisibleToParticipantOne, true);
            }
            else
            {
                updateDefinition = new UpdateDefinitionBuilder<MessageThread>().Set(thread => thread.VisibleToParticipantTwo, true);
            }
            return await context.MessageThreads.FindOneAndUpdateAsync(
                thread => thread.ParticipantOne == participantOneId && thread.ParticipantTwo == participantTwoId,
                updateDefinition);
        }

        public async Task<List<MessageThread>> GetMessageThreadsOfUser(int userId)
        {
            return await context.MessageThreads
                .FindSync(thread => (thread.ParticipantOne == userId && thread.VisibleToParticipantOne) ||
                    (thread.ParticipantTwo == userId && thread.VisibleToParticipantTwo))
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
    }
}