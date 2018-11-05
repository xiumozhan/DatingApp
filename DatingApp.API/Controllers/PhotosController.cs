using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        private readonly IDatingRepository repository;
        private readonly IMapper mapper;
        private readonly IOptions<CloudinarySettings> cloudinaryConfig;
        private Cloudinary cloudinary;

        public PhotosController(IDatingRepository repository, IMapper mapper,  
            IOptions<CloudinarySettings> cloudinaryConfig)
        {
            this.cloudinaryConfig = cloudinaryConfig;
            this.mapper = mapper;
            this.repository = repository;
            Account acc = new Account(
                cloudinaryConfig.Value.CloudName,
                cloudinaryConfig.Value.ApiKey,
                cloudinaryConfig.Value.ApiSecret
            );
            cloudinary = new Cloudinary(acc);
        }

        [HttpGet("{id}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int id)
        {
            var photoFromRepo = await repository.GetPhoto(id);
            var photo = mapper.Map<PhotoForReturnDto>(photoFromRepo);
            return Ok(photo);
        }

        [HttpPost]
        public async Task<IActionResult> AddPhotoForUser(int userId, 
            [FromForm]PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var userFromRepo = await repository.GetUser(userId);
            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult();
            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream)
                    };
                    uploadResult = cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;
            photoForCreationDto.Width = uploadResult.Width;
            photoForCreationDto.Height = uploadResult.Height;

            if (photoForCreationDto.Height != photoForCreationDto.Width)
            {
                var thumbnailUploadResult = new ImageUploadResult();
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams()
                    {
                        File = new FileDescription(file.Name, stream),
                        Transformation = new Transformation().Width(200).Height(200).Crop("thumb").Gravity("face")
                    };
                    thumbnailUploadResult = cloudinary.Upload(uploadParams);
                }
                photoForCreationDto.ThumbnailUrl = thumbnailUploadResult.Uri.ToString();
                photoForCreationDto.ThumbnailPublicId = thumbnailUploadResult.PublicId;
            }
            var photo = mapper.Map<Photo>(photoForCreationDto);

            userFromRepo.Photos.Add(photo);
            
            if (await repository.SaveAll())
            {
                var photoToReturn = mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }
            return BadRequest("Could not add the photo");
        }

        [HttpDelete]
        public async Task<IActionResult> DeletePhoto(int userId, [FromQuery(Name="ids")]string ids)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            List<int> deletedPhotoIds = ids.Split(',').Select( idString => Convert.ToInt32(idString) ).ToList();
            var user = await repository.GetUser(userId);
            List<int> authorizedPhotoIds = new List<int>();
            List<int> unauthorizedPhotoIds = new List<int>(); 
            foreach (int id in deletedPhotoIds)
            {
                if (!user.Photos.Any(p => p.Id == id))
                {
                    unauthorizedPhotoIds.Add(id);
                    continue;
                }
                authorizedPhotoIds.Add(id);
            }

            var photosFromRepo = await repository.GetPhotos(authorizedPhotoIds);
            var deleteParams = new DelResParams()
            {
                PublicIds = photosFromRepo.Select( photo => photo.PublicID ).ToList()
            };
            var photoDeletionResults = cloudinary.DeleteResources(deleteParams);
            List<Photo> photosDeleted = new List<Photo>();
            foreach (var deletionResult in photoDeletionResults.Deleted)
            {
                if (deletionResult.Value == "deleted" || deletionResult.Value == "not_found")
                {
                    photosDeleted.Add(photosFromRepo.Find( photo => photo.PublicID == deletionResult.Key ));
                }
            }

            var deleteThumbnailParams = new DelResParams()
            {
                PublicIds = photosDeleted.Select( photo => photo.ThumbnailPublicId ).ToList()
            };
            cloudinary.DeleteResources(deleteThumbnailParams);

            repository.Delete(photosDeleted);

            if (await repository.SaveAll()) {
                if (unauthorizedPhotoIds.Count > 0)
                {
                    return Unauthorized();
                }
                if (photosDeleted.Count != deletedPhotoIds.Count)
                {
                    return BadRequest("Unable to delete some of the photos");
                }
                return Ok();
            }

            return BadRequest("Failed to delete photos");
        }

        [HttpPut("setAvatar")]
        public async Task<IActionResult> SetProfileImage(int userId, [FromForm]PhotoForCreationDto photoForCreationDto)
        {
            if (userId != int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value))
            {
                return Unauthorized();
            }

            var user = await repository.GetUser(userId);
            var file = photoForCreationDto.File;
            var uploadResult = new ImageUploadResult();
            Photo existingAvatar = user.Photos.FirstOrDefault(p => p.IsAvatar);
            if (file.Length > 0)
            {
                using (var stream = file.OpenReadStream())
                {
                    ImageUploadParams uploadParams;
                    if (existingAvatar != null)
                    {
                        uploadParams = new ImageUploadParams()
                        {
                            File = new FileDescription(file.Name, stream),
                            PublicId = existingAvatar.PublicID
                        };
                    }
                    else
                    {
                        uploadParams = new ImageUploadParams()
                        {
                            File = new FileDescription(file.Name, stream)
                        };
                    }
                    uploadResult = cloudinary.Upload(uploadParams);
                }
            }

            photoForCreationDto.Url = uploadResult.Uri.ToString();
            photoForCreationDto.PublicId = uploadResult.PublicId;
            photoForCreationDto.Width = uploadResult.Width;
            photoForCreationDto.Height = uploadResult.Height;
            var photo = mapper.Map<Photo>(photoForCreationDto);
            photo.IsAvatar = true;
            if (existingAvatar != null)
            {
                user.Photos.Remove(existingAvatar);
            }
            user.Photos.Add(photo);
            if (await repository.SaveAll())
            {
                var photoToReturn = mapper.Map<PhotoForReturnDto>(photo);
                return CreatedAtRoute("GetPhoto", new { id = photo.Id }, photoToReturn);
            }
            return BadRequest("Could not add the photo");
        }
    }
}