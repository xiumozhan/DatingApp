using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace DatingApp.API.Data
{
    public class ChatMessageContext
    {
        private readonly IMongoDatabase mongoDatabase;

        public ChatMessageContext(IOptions<MongoDbSettings> options)
        {
            var client = new MongoClient(options.Value.ConnectionString);
            mongoDatabase = client.GetDatabase(options.Value.DatabaseName);
        }

        public IMongoCollection<Message> Messages
        {
            get
            {
                return mongoDatabase.GetCollection<Message>("Messages");
            }
        }

        public IMongoCollection<MessageThread> MessageThreads
        {
            get
            {
                return mongoDatabase.GetCollection<MessageThread>("MessageThreads");
            }
        }

        public IMongoCollection<UnreadMessageStatus> UnreadMessageStatuses
        {
            get
            {
                return mongoDatabase.GetCollection<UnreadMessageStatus>("UnreadMessageStatus");
            }
        }
    }
}