export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    userDetails: {
      name: string
      username: string
    }
  }
}

export declare global {
  namespace Express {
    interface Request {
      verified?: boolean
      user: {
        username: string
        token: string
      }
      errors?: { text: string; href: string }[]
      flash(type: string, message: any): number
      flash(message: string): any[]
      flash(): { [key: string]: any[] }
    }
  }
}
