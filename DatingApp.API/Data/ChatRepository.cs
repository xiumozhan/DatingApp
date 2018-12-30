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

        public async Task<int?> AddMessageToThread(Message message, ObjectId threadId, bool isRecipientFocusingOnThisConversation)
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
            return await IncreaseTotalUnreadMessageCountByOneIfNecessary(message, !isRecipientFocusingOnThisConversation);
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

        public async Task<int?> MarkThreadAsRead(ObjectId threadId, int userId, int anotherParticipantId)
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
            var threadFound = await context.MessageThreads.FindOneAndUpdateAsync(thread => thread.Id.Equals(threadId), updateOperation);
            return await SubtractTotalUnreadMessageCountIfNecessary(userId, anotherParticipantId, threadFound);
        }

        private async Task<int?> SubtractTotalUnreadMessageCountIfNecessary(int userId, int anotherParticipantId, MessageThread threadFound)
        {
            int unreadMessageCount;
            if (userId > anotherParticipantId)
            {
                unreadMessageCount = threadFound.ParticipantTwoUnreadMessageCount;
            }
            else
            {
                unreadMessageCount = threadFound.ParticipantOneUnreadMessageCount;
            }
            if (unreadMessageCount > 0)
            {
                UpdateResult updateResult = await context.UnreadMessageStatuses.UpdateOneAsync(
                    status => status.UserId == userId,
                    new UpdateDefinitionBuilder<UnreadMessageStatus>().Inc(status => status.UnreadMessageTotalCount, -unreadMessageCount)
                );
                if (updateResult.ModifiedCount > 0)
                {
                    return await GetTotalUnreadMessageCount(userId);
                }
            }
            return null;
        }

        private async Task<int?> IncreaseTotalUnreadMessageCountByOneIfNecessary(Message message, bool shouldUpdate)
        {
            if (shouldUpdate)
            {
                UpdateResult updateResult = await context.UnreadMessageStatuses.UpdateOneAsync(
                    status => status.UserId == message.RecipientId,
                    new UpdateDefinitionBuilder<UnreadMessageStatus>().Inc(status => status.UnreadMessageTotalCount, 1),
                    new UpdateOptions() { IsUpsert = true }
                );
                if (updateResult.ModifiedCount > 0)
                {
                    return await GetTotalUnreadMessageCount(message.RecipientId);
                }
            }
            return null;
        }

        public async Task<int> GetTotalUnreadMessageCount(int userId)
        {
            var unreadStatus = await context.UnreadMessageStatuses.Find(status => status.UserId == userId).SingleOrDefaultAsync();
            if (unreadStatus == null)
            {
                return 0;
            }
            return unreadStatus.UnreadMessageTotalCount;
        }
    }
}