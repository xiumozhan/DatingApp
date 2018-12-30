using System.ComponentModel.DataAnnotations.Schema;
using System.Runtime.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DatingApp.API.Models
{
    [Table("UnreadMessageStatus")]
    public class UnreadMessageStatus
    {
        [BsonId]
        public ObjectId _id { get; set; }
        [DataMember]
        public int UserId { get; set; }
        [DataMember]
        public int UnreadMessageTotalCount { get; set; } = 0;
    }
}