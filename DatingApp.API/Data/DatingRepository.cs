using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = await context.Users.Include( p => p.Photos ).ToListAsync();
            return users;
        }

        public async Task<bool> SaveAll()
        {
            return await context.SaveChangesAsync() > 0;
        }
    }
}