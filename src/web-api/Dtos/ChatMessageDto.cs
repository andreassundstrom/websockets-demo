using System;

namespace web_api.Dtos;

public class ChatMessageDto
{
    public string SenderId {get;set;}
    public string Body { get; set; }
    // public DateTimeOffset SentTime {get;set;}
}
