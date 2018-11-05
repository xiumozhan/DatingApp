using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.Dtos
{
    public class PhotoForCreationDto
    {
        public string Url { get; set; }
        public IFormFile File { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public string PublicId { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string ThumbnailUrl { get; set; }
        public string ThumbnailPublicId { get; set; }

        public PhotoForCreationDto()
        {
            this.DateAdded = DateTime.Now;
        }
    }
}