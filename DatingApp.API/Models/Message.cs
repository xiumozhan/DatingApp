using System;
using System.ComponentModel.DataAnnotations.Schema;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DatingApp.API.Models
{
    [Table("Messages")]
    public class Message
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public string MessageContent { get; set; }
        [BsonDateTimeOptions(Kind = DateTimeKind.Local)]
        public DateTime MessageSent { get; set; }

        public Message(int senderId, int recipientId, string messageContent)
        {
            this.SenderId = senderId;
            this.RecipientId = recipientId;
            this.MessageContent = messageContent;
            this.MessageSent = DateTime.Now;
        }
    }
}