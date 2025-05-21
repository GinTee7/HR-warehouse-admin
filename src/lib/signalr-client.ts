// libs/signalr-client.ts
import * as signalR from "@microsoft/signalr";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl("https://minhlong.mlhr.org/hubs/notifications", {
    accessTokenFactory: () => localStorage.getItem("token") ?? "",
  })
  .withAutomaticReconnect()
  .build();
