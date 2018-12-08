using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Helpers;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public interface IDatingRepository
    {
        void Add<T>(T entity) where T: class;
        void Delete<T>(T entity) where T: class;
        void Delete<T>(List<T> entities) where T: class;
        Task<bool> SaveAll();
        Task<PagedList<User>> GetUsers(UserParams userParams);
        Task<List<User>> GetUsers(List<int> ids);
        Task<User> GetUser(int id);
        Task<Photo> GetPhoto(int id);
        Task<List<Photo>> GetPhotos(List<int> ids);
        Task<Photo> GetAvatarForUser(int userId);
        Task<Like> GetLike(int userId, int recipientId);
    }
}