using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DatingApp.API.Models
{
    [Table("MessageThreads")]
    public class MessageThread
    {
        [BsonId]
        public ObjectId Id { get; set; }
        public int ParticipantOne { get; set; }
        public int ParticipantTwo { get; set; }
        public bool VisibleToParticipantOne { get; set; } = false;
        public bool VisibleToParticipantTwo { get; set; } = false;
        public int ParticipantOneUnreadMessageCount { get; set; } = 0;
        public int ParticipantTwoUnreadMessageCount { get; set; } = 0;
        public List<Message> Messages { get; set; } = new List<Message>();
    }
}