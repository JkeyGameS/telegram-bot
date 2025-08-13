const logger = require('../utils/logger');

/**
 * Setup all bot commands
 * @param {TelegramBot} bot - The Telegram bot instance
 */
function setupCommands(bot) {
    // Start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'User';
        
        const welcomeMessage = `
🤖 Welcome ${firstName}!

I'm a simple Telegram bot. Here are the commands you can use:

/start - Show this welcome message
/help - Get help information
/ping - Check if the bot is responsive
/echo <text> - Echo back your message
/time - Get current server time
/chatinfo - Get information about this chat

Feel free to send me any message and I'll respond!
        `;
        
        bot.sendMessage(chatId, welcomeMessage)
            .catch(err => {
                logger.error('Error sending start message:', err);
            });
        
        logger.info(`User ${firstName} (${msg.from.id}) started the bot`);
    });

    // Help command
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        
        const helpMessage = `
📖 Bot Help

Available Commands:
• /start - Show welcome message
• /help - Show this help message
• /ping - Test bot responsiveness
• /echo <text> - Echo your message back
• /time - Show current server time
• /chatinfo - Show chat information

You can also send me any text message and I'll respond to it!

If you encounter any issues, please check that the bot has the necessary permissions in this chat.
        `;
        
        bot.sendMessage(chatId, helpMessage)
            .catch(err => {
                logger.error('Error sending help message:', err);
            });
    });

    // Ping command
    bot.onText(/\/ping/, (msg) => {
        const chatId = msg.chat.id;
        
        bot.sendMessage(chatId, '🏓 Pong! Bot is online and responding.')
            .catch(err => {
                logger.error('Error sending ping response:', err);
            });
    });

    // Echo command
    bot.onText(/\/echo (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const textToEcho = match[1];
        
        if (textToEcho) {
            bot.sendMessage(chatId, `🔄 Echo: ${textToEcho}`)
                .catch(err => {
                    logger.error('Error sending echo message:', err);
                });
        } else {
            bot.sendMessage(chatId, '❌ Please provide text to echo. Usage: /echo <your text>')
                .catch(err => {
                    logger.error('Error sending echo usage message:', err);
                });
        }
    });

    // Time command
    bot.onText(/\/time/, (msg) => {
        const chatId = msg.chat.id;
        const currentTime = new Date().toLocaleString();
        
        bot.sendMessage(chatId, `🕐 Current server time: ${currentTime}`)
            .catch(err => {
                logger.error('Error sending time message:', err);
            });
    });

    // Chat info command
    bot.onText(/\/chatinfo/, (msg) => {
        const chatId = msg.chat.id;
        const chat = msg.chat;
        
        let chatInfo = `
📊 Chat Information

Chat ID: ${chatId}
Chat Type: ${chat.type}
        `;
        
        if (chat.title) {
            chatInfo += `Title: ${chat.title}\n`;
        }
        
        if (chat.username) {
            chatInfo += `Username: @${chat.username}\n`;
        }
        
        if (chat.description) {
            chatInfo += `Description: ${chat.description}\n`;
        }
        
        chatInfo += `
User Information:
- User ID: ${msg.from.id}
- First Name: ${msg.from.first_name || 'N/A'}
- Last Name: ${msg.from.last_name || 'N/A'}
- Username: ${msg.from.username ? '@' + msg.from.username : 'N/A'}
        `;
        
        bot.sendMessage(chatId, chatInfo)
            .catch(err => {
                logger.error('Error sending chat info:', err);
            });
    });

    logger.info('Bot commands registered successfully');
}

module.exports = { setupCommands };
