using System;

namespace DatingApp.API.Models
{
    public class Photo
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsAvatar { get; set; }
        public string PublicID { get; set; }
        public User User { get; set; }
        public int UserId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string ThumbnailUrl { get; set; }
        public string ThumbnailPublicId { get; set; }
    }
}