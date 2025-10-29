import { Body, Controller, Get, Post } from '@midwayjs/core';
import OpenAI from 'openai';
import tokens from '../token';

function getTokens() {
  return {
    ...tokens,
  } as {
    token: string;
    api_host: string;
    model_name: string;
  };
}

const openai = new OpenAI({
  apiKey: getTokens().token,
  baseURL: getTokens().api_host,
});

@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }

  // @Get('/chat')
  // async chat(@Query('msg') msg): Promise<string> {
  //   console.log(msg);
  //   const completion = await openai.chat.completions.create({
  //     messages: [
  //       { role: 'system', content: 'You are a helpful assistant.' + msg },
  //     ],
  //     model: getTokens().model_name,
  //   });
  //   console.log(completion, completion.choices);
  //   const result = completion.choices[0].message.content;

  //   return getTokens().token + result;
  // }
  @Post('/chat')
  async chat(@Body() body): Promise<{
    msg: string;
  }> {
    const { model, message = '' } = body;

    const completion = await openai.chat.completions.create({
      model: model || getTokens().model_name,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message },
      ],
    });
    const result = completion.choices[0].message.content;

    return {
      msg: result,
    };
  }
}
