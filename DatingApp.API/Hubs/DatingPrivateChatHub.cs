using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using MongoDB.Bson;

namespace DatingApp.API.Hubs
{
    [ServiceFilter(typeof(LogUserActivity))]
    [Authorize]
    public class DatingPrivateChatHub : Hub
    {
        private static ConcurrentDictionary<int, int> userConnectionAmount = new ConcurrentDictionary<int, int>();
        private static ConcurrentDictionary<int, List<int>> userFocusingMessageThreads = new ConcurrentDictionary<int, List<int>>();
        private static readonly object userFocusListLock = new object();
        private readonly string onlineStatusListenerGroupName = "OnlineStatusListeners";
        private readonly IChatRepository repository;

        public DatingPrivateChatHub(IChatRepository repository)
        {
            this.repository = repository;
        }

        [HubMethodName("StartListeningUsersOnlineStatus")]
        public async Task JoinOnlineStatusListenerGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, onlineStatusListenerGroupName);
        }

        [HubMethodName("StopListeningUsersOnlineStatus")]
        public async Task LeaveOnlineStatusListenerGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, onlineStatusListenerGroupName);
        }

        [HubMethodName("MarkThreadAsRead")]
        public async Task MarkThreadAsRead(string threadId, int anotherParticipantId)
        {
            int userId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await repository.MarkThreadAsRead(ObjectId.Parse(threadId), userId, anotherParticipantId);
        }

        [HubMethodName("FocusOnThread")]
        public void FocusOnThread(int anotherParticipantId)
        {
            int userId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            userFocusingMessageThreads.AddOrUpdate(
                userId,
                new List<int>(anotherParticipantId),
                (key, usersList) => {
                    lock (userFocusListLock)
                    {
                        usersList.Add(userId);
                        return usersList;
                    }
                });
        }

        [HubMethodName("LoseFocusOnThread")]
        public void LoseFocusOnThread(int anotherParticipantId)
        {
            int userId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var newUsersList = new List<int>();
            if (userFocusingMessageThreads.TryGetValue(userId, out newUsersList))
            {
                lock (userFocusListLock)
                {
                    newUsersList.Remove(anotherParticipantId);
                }
            }
        }

        [HubMethodName("SendPrivateMessage")]
        public async Task SendChatMessage(string threadId, int recipientId, string message)
        {
            int senderId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var isRecipientFocusingOnThisConversation = false;
            var recipientFocusingConversationList = new List<int>();
            if (userFocusingMessageThreads.TryGetValue(recipientId, out recipientFocusingConversationList))
            {
                isRecipientFocusingOnThisConversation = recipientFocusingConversationList.Contains(senderId);
            }
            var messageToSave = new Message(senderId, recipientId, message);
            var messageToSent = new MessageForReceive() {
                ThreadId = threadId,
                SenderId = senderId,
                RecipientId = recipientId,
                MessageContent = message,
                MessageSent = messageToSave.MessageSent
            };
            await repository.AddMessageToThread(messageToSave, ObjectId.Parse(threadId), isRecipientFocusingOnThisConversation);
            await Task.WhenAll(new [] {
                Clients.Group(recipientId.ToString()).SendAsync("ReceiveMessage", messageToSent ),
                Clients.Group(senderId.ToString()).SendAsync("ReceiveMessage", messageToSent )
            });
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
            int currentUserId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await Groups.AddToGroupAsync(Context.ConnectionId, currentUserId.ToString());
            int currentActiveConnectionAmount = userConnectionAmount.AddOrUpdate(currentUserId, 1, (key, oldValue) => oldValue + 1 );
            if (currentActiveConnectionAmount == 1)
            {
                await Clients.Group(onlineStatusListenerGroupName).SendAsync("UserGoOnline", currentUserId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            int currentUserId = int.Parse(Context.User.FindFirst(ClaimTypes.NameIdentifier).Value);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, currentUserId.ToString());
            int currentActiveConnectionAmount = userConnectionAmount.AddOrUpdate(currentUserId, 0, (key, oldValue) => oldValue - 1 );
            if (currentActiveConnectionAmount == 0)
            {
                await Clients.Group(onlineStatusListenerGroupName).SendAsync("UserGoOffline", currentUserId);
            }
        }
    }
}