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

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            var mainPhoto = await context.Photos
                .Where( u => u.UserId == userId )
                .FirstOrDefaultAsync( p => p.IsMain );
            return mainPhoto;
        }

        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await context.Photos.FirstOrDefaultAsync( p => p.Id == id );
            return photo;
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

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}