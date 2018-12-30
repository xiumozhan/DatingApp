using System.ComponentModel.DataAnnotations.Schema;

namespace DatingApp.API.Models
{
    [Table("UnreadMessageStatus")]
    public class UnreadMessageStatus
    {
        public int UserId { get; set; }
        public int UnreadMessageTotalCount { get; set; } = 0;
    }
}