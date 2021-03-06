using System;

namespace DatingApp.API.Dtos
{
    public class PhotoForReturnDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public bool IsAvatar { get; set; }
        public string PublicId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string ThumbnailUrl { get; set; }
    }
}