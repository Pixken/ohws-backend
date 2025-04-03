import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CashCategoryService } from '../cash-category/cash-category.service';
import { CashService } from '../cash/cash.service';
import { AccountService } from '../account/account.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OpenAI } from 'openai';
@Injectable()
export class AiService {
  private readonly apiKey: string = 'sk-0afcdf8a830d454db89eccc05de51ee5';
  private readonly apiUrl: string = 'https://api.siliconflow.cn/v1/chat/completions';

  private ctx: any[] = []

  constructor(
    private readonly cashCategoryService: CashCategoryService,
    private readonly cashService: CashService,
    private readonly accountService: AccountService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  onModuleInit() {
    this.eventEmitter.on('getIcon', async (question: string) => {
      const icon = await this.getIcon(question);
      return icon as string;
    });
  }

  async chat(question: string, context: string = '', stream: boolean = false, config: any = {}): Promise<any> {
    try {

      if (!stream) {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'deepseek-ai/DeepSeek-V3',
            stream: false,
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            frequency_penalty: 0.5,
            n: 1,
            ...config,
            messages: [
              { role: 'system', content: context },
              { role: 'user', content: question },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        );
        return response.data.choices[0].message.content.trim();
      }

      return axios.post(
        this.apiUrl,
        {
          model: 'deepseek-ai/DeepSeek-V3',
          stream: true,
          max_tokens: 512,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          ...config,
          messages: [
            { role: 'system', content: context },
            { role: 'user', content: question },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',  // 添加这个配置
        },
      );
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw new Error('Failed to get response from DeepSeek');
    }
  }

  async chat2(question: string, context: string = '', stream: boolean = false, config: any = {}): Promise<any> {
    const openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    });
    const response = await openai.chat.completions.create({
      model: 'deepseek-v3',
      messages: [{ role: 'user', content: question}, { role: 'system', content: context }],
      stream: stream, 
      ...config,
    });
    if (!stream) {
      return response.choices[0].message.content.trim();
    }
    return response;
  }

  async ask(question: string, userId: string, time: string, stream: boolean): Promise<any> {
    if (this.ctx.length > 0) {
      question = this.ctx.join('\n') + '\n' + question;
      this.ctx = [];
    }
    let generateCash = await this.generateCash(question, userId, time);
    generateCash = JSON.parse(generateCash);
    console.log(generateCash);
    let context = '';
    if (generateCash.type === 'query') {
      const cash = await this.cashService.findAllByTime(userId, generateCash.daterange);
      console.log(cash);
      context = `
      查询结果：
      时间范围：${generateCash.daterange}
      消费记录：${cash.map(item => `${item.category.name} ${item.price} ${item.account.name}`).join('\n')}
      `;
    }

    if (generateCash.type === 'income' || generateCash.type === 'expense') {
      if (!generateCash.accountId || !generateCash.categoryId) {
        this.ctx.push(question)
        const accounts = await this.accountService.findAccounts(userId);
        const cashCategories = await this.cashCategoryService.findAllByUser(userId);
        context = `
         用户有以下账户：${accounts.map(item => `${item.name} accountId：${item.id}`).join('\n')}。
         用户有以下消费类别：${cashCategories.map(item => `${item.name} categoryId：${item.id}`).join('\n')}。
         使用简洁的语言，提醒用户选择账户和消费类别。
         只对选择账户和消费类别做提醒，不要输出其他内容。
        `;
      } else {
        const icon = await this.getIcon(generateCash.description);
        const cash = await this.cashService.create({ cash: { price: generateCash.price, description: generateCash.description, type: generateCash.type, categoryId: generateCash.categoryId, icon: icon.split('------')[0], color: icon.split('------')[1] }, userId, accountId: generateCash.accountId });
        context = `
        记录结果：
        时间范围：${generateCash.daterange}
        消费记录：${cash.category.name} ${cash.price} ${cash.account.name}
        `;
      }
    }
    const systemPrompt = `
    你叫小蛋，是一个专业的记账助手，专门帮助用户管理消费记录。请按照以下规则回答用户的问题：
    1. 提供准确的数据，并附上简单的分析。
    2. 如果用户的问题涉及未来规划（如预算建议），请给出建议。
    3. 语气保持友好和专业，可以使用一些表情。
    4. 如果用户在某个类别上花费过多，请提醒他们注意控制开支。
    5. 如果用户的问题中询问了关于某些方面的消费，也请只给出该方面的消费记录。例如：吃饭就可以只给出吃饭相关的消费记录。
    `;

    return this.chat2(question, `${systemPrompt}\n上下文信息：${context}\n用户问题：${question}`, stream);
  }

  async generateCash(question: string, userId?: string, time?: string) {
    const date = new Date();
    const accounts = await this.accountService.findAccounts(userId);
    const cashCategories = await this.cashCategoryService.findAllByUser(userId);
    console.log(accounts, cashCategories);
    const systemPrompt = `
    请根据用户问题，生成一个消费记录的 json 字符串。
    当前时间为 ${date.toLocaleString()}。
    1. 消费记录的 json 字符串格式如下：
    {
      price: number | null;
      description: string | null;
      type: income | expense | null;
      categoryId: string | null;  
      对应${JSON.stringify(cashCategories.map(item => {
        return {
          name: item.name,
          categoryId: item.id
        }
      }))}
      accountId: string | null;  
      对应${JSON.stringify(accounts.map(item => {
        return {
          name: item.name,
          balance: item.balance,
          accountId: item.id
        }
      }))}
    }
    {
      daterange: string[] | null;
      description: string | null;
      type: query | null;
      categoryId: string | null;  
      对应${JSON.stringify(cashCategories.map(item => {
        return {
          name: item.name,
          categoryId: item.id
        }
      }))}
      accountId: string | null;  
      对应${JSON.stringify(accounts.map(item => {
        return {
          name: item.name,
          balance: item.balance,
          accountId: item.id
        }
      }))}
    }
    2. 如果问题以及上下文信息无法生成消费记录的 json 字符串，请直接返回失败。
    请严格按照要求直接返回消费记录的 json 字符串或失败，不要输出其他内容,不要markdown格式。
    `;
    console.log(systemPrompt);
    const context = question;
    return this.chat2(question, `${systemPrompt}\n上下文信息：${context}`, false, { temperature: 0.1 });
  }


  async getIcon(question: string) {
    const systemPrompt = `
    你是一个专业的icon设计师，请根据用户的问题，选择以下icon。
    "radix-icons:hobby-knife",
    "material-symbols:work",
    "icon-park-twotone:sport",
    "solar:gamepad-bold",
    "ri:funds-box-fill",
    "uil:social-distancing",
    "lineicons:travel",
    "ic:baseline-emoji-emotions",
    "streamline:natrue-ecology-recycle-1-sign-environment-protect-save-arrows",
    "material-symbols:book-ribbon",
    "mingcute:hospital-fill",
    "material-symbols:directions-car-rounded",
    "map:clothing-store",
    "mingcute:cash-fill",
    "ri:refund-fill",
    "zondicons:location-food"
    接着挑选一个合适的图标颜色，
    最后返回一个字符串，格式如下：
    icon------color
    请严格按照要求直接返回字符串，不要输出其他内容,不要markdown格式。
    `
    return this.chat2(question, systemPrompt, false, { temperature: 0.1 })
  }
}
