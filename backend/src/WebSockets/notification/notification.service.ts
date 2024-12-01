import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../Models/notification.schema';
import { NotificationType } from '../../enums/notification-type.enum';
import { Types } from 'mongoose';
import { NotificationsGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly notificationGateway: NotificationsGateway,
  ) {}

  async createNotification(userId: string, message: string, type: NotificationType, targetId: Types.ObjectId): Promise<Notification> {
    const notification = new this.notificationModel({
      user_id: userId,
      content: message,
      type: type,
      target_id: targetId,
    });
    await this.notificationGateway.sendNotification(userId, message);
    return notification.save();
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationModel.find({ user_id: userId }).sort({ createdAt: -1 }).exec();
  }
}
