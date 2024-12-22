import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../Models/notification.schema';
import { NotificationType } from '../../enums/notification-type.enum';
import { Types } from 'mongoose';
import { NotificationsGateway } from './notification.gateway';
import { PusherService } from '../../pusher/pusher.service';


@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly pusherService: PusherService,
  ) {}

  async createNotificationForChat(userId: string, targetId: Types.ObjectId, chat_name:string): Promise<Notification> {
    const notification = await this.createNotification(userId, "New message", NotificationType.MESSAGE, targetId);
    await this.triggerNotificationForMessages(userId, NotificationType.MESSAGE, chat_name);
    return notification;
  }

  async createNotificationForAnnouncement(userId: string, message:string ,targetId: Types.ObjectId, course:string): Promise<Notification> {
    const notification = await this.createNotification(userId, message, NotificationType.ANNOUNCEMENT, targetId);
    await this.triggerNotificationForAnnouncement(userId, NotificationType.ANNOUNCEMENT, message, course);
    return notification;
  }

 async createNotificationForReply(userId: string, message: string, targetId: Types.ObjectId): Promise<Notification> {
    const notification = await this.createNotification(userId, message, NotificationType.REPLY, targetId);
    await this.triggerNotificationForReply(userId, NotificationType.REPLY, message);
    return notification;
  }


  async createNotification(userId: string, message: string, type: NotificationType, targetId: Types.ObjectId): Promise<Notification> {
    const notification = new this.notificationModel({
      user_id: userId,
      content: message,
      type: type,
      target_id: targetId,
    });
    return notification.save();
  }

  async triggerNotificationForMessages(userId: string, event:NotificationType, chat_name:string) {
    this.pusherService.trigger(`user-${userId}`, event , `New message in chat ${chat_name}`);
  }

  async triggerNotificationForAnnouncement(userId: string, event:NotificationType, message: string, target:string) {
    this.pusherService.trigger(`user-${userId}`, event , `New announcement in ${target}: ${message}`);
  }

  async triggerNotificationForReply(userId: string, event:NotificationType, message: string) {
    this.pusherService.trigger(`user-${userId}`, event , message);
  }


  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ user_id: userId }).sort({ createdAt: -1 }).exec();
  }
}
