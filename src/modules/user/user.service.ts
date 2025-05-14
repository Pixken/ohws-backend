import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import * as svgCaptcha from 'svg-captcha';
import { v4 as uuidv4 } from 'uuid';

// Map to store captcha codes with expiration
const captchaStore = new Map<string, { text: string; expires: Date }>();

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: any) {
    return this.prisma.sysUser.create({ data });
  }

  async findUsers() {
    return this.prisma.sysUser.findMany();
  }

  async findUser(id: string) {
    return this.prisma.sysUser.findUnique({ where: { id } });
  }

  async getCaptcha() {
    // Create captcha
    const captcha = svgCaptcha.create({
      size: 4, // captcha text length
      ignoreChars: '0o1i', // filter confusing characters
      noise: 2, // number of noise lines
      color: true, // characters will have colors instead of grey
      background: '#f0f0f0', // background color
      width: 120,
      height: 40,
    });
    
    // Convert SVG to base64
    const base64 = Buffer.from(captcha.data).toString('base64');
    
    // Generate unique ID for this captcha
    const uuid = uuidv4();
    
    // Set expiration (5 minutes from now)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 5);
    
    // Store captcha text with expiration
    captchaStore.set(uuid, {
      text: captcha.text.toLowerCase(), // Store lowercase for case-insensitive validation
      expires
    });
    
    // Clean up expired captchas
    this.cleanupCaptchas();
    
    // Return the response
    return {
      uuid, // ID for validation
      image: `data:image/svg+xml;base64,${base64}` // Base64 encoded image
    };
  }
  
  validateCaptcha(uuid: string, code: string): boolean {
    // Check if captcha exists in store
    if (!captchaStore.has(uuid)) {
      return false;
    }
    
    const captcha = captchaStore.get(uuid);
    
    // Check if captcha has expired
    if (captcha.expires < new Date()) {
      captchaStore.delete(uuid); // Clean up expired captcha
      return false;
    }
    
    // Validate code (case-insensitive)
    const isValid = captcha.text === code.toLowerCase();
    
    // Remove the captcha after use (one-time use)
    captchaStore.delete(uuid);
    
    return isValid;
  }
  
  private cleanupCaptchas() {
    const now = new Date();
    for (const [key, captcha] of captchaStore.entries()) {
      if (captcha.expires < now) {
        captchaStore.delete(key);
      }
    }
  }
}
