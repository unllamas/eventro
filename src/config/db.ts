import { init } from '@instantdb/react';

const APP_ID = process.env.INSTANT_DB;
const ADMIN_TOKEN = '';

type AppSchema = {};

export const db = init<AppSchema>({ appId: APP_ID as string });
