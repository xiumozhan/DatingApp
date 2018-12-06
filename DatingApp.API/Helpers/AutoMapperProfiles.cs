using System.Linq;
using AutoMapper;
using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<User, UserForListDto>()
                .ForMember(dest => dest.Avatar, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsAvatar));
                })
                .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CalculateAge());
                });
            CreateMap<User, UserForDetailedDto>()
                .ForMember(dest => dest.Avatar, opt => {
                    opt.MapFrom(src => src.Photos.FirstOrDefault(p => p.IsAvatar));
                })
                .ForMember(dest => dest.Age, opt => {
                    opt.ResolveUsing(d => d.DateOfBirth.CalculateAge());
                })
                .ForMember(dest => dest.Photos, opt => {
                    opt.MapFrom(src => src.Photos.Where( photo => !photo.IsAvatar ));
                });
            CreateMap<Photo, PhotosForDetailedDto>();
            CreateMap<UserForUpdateDto, User>();
            CreateMap<Photo, PhotoForReturnDto>();
            CreateMap<PhotoForCreationDto, Photo>();
            CreateMap<UserForRegisterDto, User>();
            CreateMap<MessageThread, MessageThreadForReturnDto>()
                .ForMember(dest => dest.Participant, opt => {
                    opt.ResolveUsing((src, dest, arg3, context) => {
                        if ((int)context.Options.Items["UserRequestingIt"] == src.ParticipantOne)
                        {
                            return src.ParticipantTwo;
                        }
                        return src.ParticipantOne;
                    });
                })
                .ForMember(dest => dest.UnreadMessageCount, opt => {
                    opt.ResolveUsing((src, dest, arg3, context) => {
                        if ((int)context.Options.Items["UserRequestingIt"] == src.ParticipantOne)
                        {
                            return src.ParticipantOneUnreadMessageCount;
                        }
                        return src.ParticipantTwoUnreadMessageCount;
                    });
                })
                .ForMember(dest => dest.LatestMessage, opt => {
                    opt.MapFrom(src => src.Messages.ElementAtOrDefault(src.Messages.Capacity - 1));
                });
        }
    }
}