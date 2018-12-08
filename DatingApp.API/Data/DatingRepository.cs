using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext context;
        public DatingRepository(DataContext context)
        {
            this.context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            context.Add(entity);
        }

        public void Delete<T>(T entity) where T : class
        {
            context.Remove(entity);
        }

        public void Delete<T>(List<T> entities) where T : class
        {
            context.RemoveRange(entities);
        }

        public async Task<Photo> GetAvatarForUser(int userId)
        {
            var mainPhoto = await context.Photos
                .Where( u => u.UserId == userId )
                .FirstOrDefaultAsync( p => p.IsAvatar );
            return mainPhoto;
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await context.Likes.FirstOrDefaultAsync(u => 
                u.LikerId == userId && u.LikeeId == recipientId);
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await context.Photos.FirstOrDefaultAsync( p => p.Id == id );
            return photo;
        }

        public async Task<List<Photo>> GetPhotos(List<int> ids)
        {
            var photos = await context.Photos.Where( photo => ids.Contains(photo.Id) ).ToListAsync();
            return photos;
        }

        public async Task<User> GetUser(int id)
        {
            var user = await context.Users.Include( p => p.Photos ).FirstOrDefaultAsync( u => u.Id == id );
            return user;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = context.Users.Include( p => p.Photos )
                .OrderByDescending(u => u.LastActive).AsQueryable();
            users = users.Where(u => u.Id != userParams.UserId);
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            DateTime? minDateOfBirth = null;
            DateTime? maxDateOfBirth = null;
            if (userParams.MinAge.HasValue)
            {
                maxDateOfBirth = DateTime.Today.AddYears(-userParams.MinAge.Value);
            }
            if (userParams.MaxAge.HasValue)
            {
                minDateOfBirth = DateTime.Today.AddYears(-userParams.MaxAge.Value - 1);
            }

            if (minDateOfBirth.HasValue && maxDateOfBirth.HasValue)
            {
                users = users.Where(u => u.DateOfBirth >= minDateOfBirth && u.DateOfBirth <= maxDateOfBirth);
            }
            else if (minDateOfBirth.HasValue)
            {
                users = users.Where(u => u.DateOfBirth >= minDateOfBirth);
            }
            else if (maxDateOfBirth.HasValue)
            {
                users = users.Where(u => u.DateOfBirth <= maxDateOfBirth);
            }

            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }
            return await PagedList<User>.CreateAsync(users, userParams.PageNumber, userParams.PageSize);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {
            var user = await context.Users
                .Include(x => x.Likers)
                .Include(x => x.Likees)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likees.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;
        }

        public async Task<List<User>> GetUsers(List<int> ids)
        {
            var users = await context.Users
                .Include( p => p.Photos )
                .Where( user => ids.Contains(user.Id) )
                .ToListAsync();
            return users;
        }
    }
}