import { Injectable } from "@nestjs/common";
import { OpenAI } from 'openai';
import { CashCategoryService } from "../cash-category/cash-category.service";
import { CashService } from "../cash/cash.service";
import { AccountService } from "../account/account.service";
@Injectable()
export class AiV2Service {
  constructor(private readonly cashCategoryService: CashCategoryService, private readonly cashService: CashService, private readonly accountService: AccountService) { }

  private tools: any[] = []

  async init(userId: string) {
    const accounts = await this.accountService.findAccounts(userId);
    const cashCategories = await this.cashCategoryService.findAllByUser(userId);
    this.tools = [
      {
        type: 'function',
        function: {
          name: 'add_cash',
          description: '添加消费记录',
          parameters: {
            type: 'object',
            properties: {
              price: { type: 'number' },
              description: { type: 'string' },
              type: { type: 'string', enum: ['income', 'expense'] },
              category: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', enum: cashCategories.map(item => item.id) },
                    name: { type: 'string', enum: cashCategories.map(item => item.name) }
                  }
                }
              },
              account: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', enum: accounts.map(item => item.id) },
                    name: { type: 'string', enum: accounts.map(item => item.name) }
                  }
                }
              },
              color: { type: 'string' },
              icon: {
                type: 'string', enum: [
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
                ]
              }
            },
            required: ['price', 'description', 'type', 'category', 'account', 'color', 'icon']
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_cash',
          description: '获取消费记录',
          parameters: {
            type: 'object',
            properties: {
              daterange: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              category: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', enum: cashCategories.map(item => item.id) },
                    name: { type: 'string', enum: cashCategories.map(item => item.name) }
                  }
                }
              },
              account: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', enum: accounts.map(item => item.id) },
                    name: { type: 'string', enum: accounts.map(item => item.name) }
                  }
                }
              },
              type: { type: 'string', enum: ['income', 'expense'] }
            }
          }
        }
      }
    ]
  }

  async executeFunction(name: string, args: any, userId: string) {
    switch (name) {
      case 'add_cash':
        return await this.addCash(args, userId);
      case 'get_cash':
        return await this.getCash(args, userId);
      default:
        throw new Error(`未知函数: ${name}`);
    }
  }

  async addCash(args: any, userId: string) {
    const cash = await this.cashService.create({
      cash: {
        price: args.price,
        description: args.description,
        type: args.type,
        categoryId: args.category[0].id,
        icon: args.icon,
        color: args.color
      },
      userId,
      accountId: args.account[0].id
    });
    return cash;
  }

  async getCash(args: any, userId: string) {
    const cash = await this.cashService.findAllByTime(userId, args.daterange, args.account?.[0]?.id, args.category?.[0]?.id, args.type);
    return cash;
  }

  async chat(userInput: string, userId: string) {
    await this.init(userId);
    const openai = new OpenAI({
      apiKey: 'sk-506a08a471ad4298a5d43d839709b837',
      baseURL: "https://api.deepseek.com"
    });
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: userInput }, { role: 'system', content: '当前时间为' + new Date().toLocaleString() }],
      stream: false,
      tools: this.tools,
      tool_choice: 'auto',
    });
    const { message } = response.choices[0];
    // 第二步：检查模型是否想要调用函数
    if (message.tool_calls) {
      const toolResponses = [];

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || '{}'); // 处理无参数的情况

        try {
          const functionResponse = await this.executeFunction(functionName, functionArgs, userId);

          toolResponses.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(functionResponse),
          });
        } catch (error) {
          console.error(`执行函数 ${functionName} 出错:`, error);
          // 返回错误信息给AI
          toolResponses.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify({ error: error.message }),
          });
        }
      }

      // 第三步：将函数响应发送回模型获取最终回答
      const secondResponse = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: userInput },
          { role: "system", content: `你叫小蛋，是一个专业的记账助手，专门帮助用户管理消费记录。请按照以下规则回答用户的问题：
            1. 提供准确的数据，并附上简单的分析。
            2. 如果用户的问题涉及未来规划（如预算建议），请给出建议。
            3. 语气保持友好和专业，可以使用一些表情。
            4. 如果用户在某个类别上花费过多，请提醒他们注意控制开支。` },
          message,
          ...toolResponses,
        ],
        stream: true,
      });
      
      return secondResponse;
    }
    return message.content;
  }


}
