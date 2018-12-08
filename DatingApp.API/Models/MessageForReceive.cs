using System;

namespace DatingApp.API.Models
{
    public class MessageForReceive
    {
        public string ThreadId { get; set; }
        public int SenderId { get; set; }
        public int RecipientId { get; set; }
        public string MessageContent { get; set; }
        public DateTime MessageSent { get; set; }
    }
}