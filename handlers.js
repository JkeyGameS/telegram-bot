const logger = require('../utils/logger');

/**
 * Setup message handlers and other bot event handlers
 * @param {TelegramBot} bot - The Telegram bot instance
 */
function setupHandlers(bot) {
    // Handle all text messages that are not commands
    bot.on('message', (msg) => {
        // Skip if message is a command (starts with /)
        if (msg.text && msg.text.startsWith('/')) {
            return;
        }

        const chatId = msg.chat.id;
        const messageText = msg.text;
        const firstName = msg.from.first_name || 'User';

        if (messageText) {
            handleTextMessage(bot, chatId, messageText, firstName, msg);
        }
    });

    // Handle callback queries (inline keyboard button presses)
    bot.on('callback_query', (callbackQuery) => {
        const message = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = message.chat.id;

        logger.info(`Callback query received: ${data} from user ${callbackQuery.from.id}`);

        // Answer the callback query to remove loading state
        bot.answerCallbackQuery(callbackQuery.id)
            .catch(err => {
                logger.error('Error answering callback query:', err);
            });

        // Handle different callback data
        handleCallbackQuery(bot, chatId, data, callbackQuery);
    });

    // Handle new chat members
    bot.on('new_chat_members', (msg) => {
        const chatId = msg.chat.id;
        const newMembers = msg.new_chat_members;

        newMembers.forEach(member => {
            if (member.is_bot && member.id === bot.options.polling ? bot.token : bot.token) {
                // Bot was added to the group
                const welcomeMessage = `
🤖 Hello everyone!

I'm a Telegram bot that can help with various tasks. Type /help to see what I can do!

Thanks for adding me to the group!
                `;
                
                bot.sendMessage(chatId, welcomeMessage)
                    .catch(err => {
                        logger.error('Error sending group welcome message:', err);
                    });
            } else {
                // Regular user joined
                const memberName = member.first_name || 'New Member';
                bot.sendMessage(chatId, `👋 Welcome ${memberName} to the group!`)
                    .catch(err => {
                        logger.error('Error sending member welcome:', err);
                    });
            }
        });
    });

    // Handle when someone leaves the chat
    bot.on('left_chat_member', (msg) => {
        const chatId = msg.chat.id;
        const leftMember = msg.left_chat_member;
        const memberName = leftMember.first_name || 'Member';

        if (!leftMember.is_bot) {
            bot.sendMessage(chatId, `👋 Goodbye ${memberName}!`)
                .catch(err => {
                    logger.error('Error sending goodbye message:', err);
                });
        }
    });

    logger.info('Bot handlers registered successfully');
}

/**
 * Handle regular text messages
 */
function handleTextMessage(bot, chatId, messageText, firstName, msg) {
    logger.info(`Message from ${firstName} (${msg.from.id}): ${messageText}`);

    // Simple response logic based on message content
    let response = '';

    const lowerText = messageText.toLowerCase();

    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        response = `👋 Hello ${firstName}! How can I help you today?`;
    } else if (lowerText.includes('how are you') || lowerText.includes('how do you do')) {
        response = '🤖 I\'m doing great! Thanks for asking. How are you?';
    } else if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you')) {
        response = `👋 Goodbye ${firstName}! Have a great day!`;
    } else if (lowerText.includes('thank') || lowerText.includes('thanks')) {
        response = '😊 You\'re welcome! Happy to help!';
    } else if (lowerText.includes('help')) {
        response = '🆘 I can help you! Try using /help to see all available commands.';
    } else if (lowerText.includes('joke') || lowerText.includes('funny')) {
        const jokes = [
            'Why don\'t scientists trust atoms? Because they make up everything! 😄',
            'Why did the robot go to therapy? It had too many bugs! 🤖',
            'What do you call a bear with no teeth? A gummy bear! 🐻',
            'Why don\'t programmers like nature? It has too many bugs! 🐛'
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
    } else {
        // Default response with some interactive options
        response = `📝 I received your message: "${messageText}"\n\nTry sending me:\n• "hello" for a greeting\n• "help" for assistance\n• "joke" for a laugh\n• Or use /help for all commands`;
    }

    // Send response with error handling
    bot.sendMessage(chatId, response)
        .catch(err => {
            logger.error('Error sending text response:', err);
            
            // Try to send a simple error message
            bot.sendMessage(chatId, '❌ Sorry, I encountered an error while processing your message.')
                .catch(retryErr => {
                    logger.error('Error sending error message:', retryErr);
                });
        });
}

/**
 * Handle callback queries from inline keyboards
 */
function handleCallbackQuery(bot, chatId, data, callbackQuery) {
    let response = '';

    switch (data) {
        case 'help':
            response = '📖 You pressed the help button! Use /help for detailed information.';
            break;
        case 'info':
            response = '📊 Bot Information:\n• Version: 1.0.0\n• Status: Online\n• Commands: Available';
            break;
        default:
            response = `🔘 You pressed: ${data}`;
    }

    bot.sendMessage(chatId, response)
        .catch(err => {
            logger.error('Error handling callback query:', err);
        });
}

module.exports = { setupHandlers };
