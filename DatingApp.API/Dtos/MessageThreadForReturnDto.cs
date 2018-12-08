using DatingApp.API.Models;
using MongoDB.Bson;

namespace DatingApp.API.Dtos
{
    public class MessageThreadForReturnDto
    {
        public ObjectId Id { get; set; }
        public UserForListDto Participant { get; set; }
        public int UnreadMessageCount { get; set; }
        public Message LatestMessage { get; set; }
    }
}