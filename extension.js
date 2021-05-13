const vscode = require('vscode');
const path = require('path');
const Discord = require('discord.js-selfbot');

// const discordChat = require('./test Discord Integration/discordChat.js');

const pyTools = require('./src/pyTools.js');
const jsTools = require('./src/jsTools.js');

const DiscordTreeViewProvider = require("./src/discordTreeViewProvider.js");
const discordChatWebview = require("./src/discordChatWebview.js");
const statusBar = require("./src/statusBar.js")

const discordToken = require('./test Discord Integration/test.json');

let discordStatusBarItem;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "discord-tools" is now active!');

    


    // Discord test
    const client = new Discord.Client();

    // client.on('ready', () => {
    //     console.log(`Logged in as ${client.user.tag}!`);
        
    //     // Create the Discord Tree View
    //     let discordTreeViewProvider = new DiscordTreeViewProvider(client);
        
    //     let view = vscode.window.createTreeView("discordTreeView", {
    //         treeDataProvider: discordTreeViewProvider,
    //     });
    //     // Update the status bar
    //     statusBar.updateStatusBarItem(discordStatusBarItem, "$(comments-view-icon) Connected to Discord Chat")
    //     context.subscriptions.push(view);
    // });

    // client.on('message', message => {
    //     if (message.author.id == "351641602067922945")
    //     {
    //         console.log(message)
    //     }
        
    // })

    // client.login(discordToken.token);


    // Status Bar
    discordStatusBarItem = statusBar.createStatusBarItem(discordStatusBarItem);
    statusBar.showStatusBarItem(discordStatusBarItem);

    // Open the Discord Chat
    let openDiscordChat = vscode.commands.registerCommand('discord-tools.openDiscordChat', function () {
        const discordChatWebviewPanel = vscode.window.createWebviewPanel(
            'discordChat', // Identifies the type of the webview. Used internally
            'Discord Chat', // Title of the panel displayed to the user
            vscode.ViewColumn.Two, // Editor column to show the new webview panel in
            {
                // Webview options
                enableScripts: true
            } 
        );
        
        const htmlFile = discordChatWebview.getDiscordChatWebviewContent(vscode.Uri.file(path.join(context.extensionPath, 'webView', 'index.html')));
        const cssStylePath = vscode.Uri.file(path.join(context.extensionPath, 'webView', 'style.css'));
        const cssThemeRes = cssStylePath.with({ scheme: 'vscode-resource' });
        const cssThemeLinkTag = '<link rel="stylesheet" id = "swpd-theme" href="' + cssThemeRes + '" type="text/css" media="all" />';
        
        discordChatWebviewPanel.webview.html = cssThemeLinkTag + htmlFile;
    });
    context.subscriptions.push(openDiscordChat);

    // Generate a python template bot (Discord.py)
	let pyBotTemplate = vscode.commands.registerCommand('discord-tools.pyBotTemplate', function () {
        pyTools.pyCreateTemplateBot();
	});
    context.subscriptions.push(pyBotTemplate);
    
    // Generate a javascript template bot (Discord.js)
	let jsBotTemplate = vscode.commands.registerCommand('discord-tools.jsBotTemplate', async () =>  {

        const legend = {

			"Do not install packages": {
                "packages": false
			},

			"Install packages": {
                "packages": true,
				"package_manager": { "npm": "npm install ", "yarn": "yarn install" }
			}
		};


		let library = await vscode.window.showQuickPick(Object.keys(legend), { "placeHolder": "Select" });
		if (library) {

            library = legend[library]
            
            if (library["packages"] == true) {
                
                let packageManager = await vscode.window.showQuickPick(Object.keys(library.package_manager), { "placeHolder": 'Select a package manager' });
                
                if (packageManager) {
                    // Create the bot template
                    jsTools.jsCreateTemplateBot();
                    
                    // Download packages
                    let terminal = vscode.window.createTerminal({ "hideFromUser": false, "name": "Install packages"});
                    terminal.show();
                    terminal.sendText(library.package_manager[packageManager]);
                    
                    vscode.window.showInformationMessage("Packages downloaded!");
                }
            } else {
                // Create the bot template
                jsTools.jsCreateTemplateBot();
            }  
        };
	});
    context.subscriptions.push(jsBotTemplate);
    
    // Open the Discord bot Documention
	let openDiscordDoc = vscode.commands.registerCommand('discord-tools.openDiscordDoc', function () {    

        // Get the active editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;

            // Supported langues
            const supportedLanguages = ["javascript", "python", "typescript", "java"];
            // Get the good documentation
            const language = document.languageId;

            // Check if the language is supported
            if (!supportedLanguages.includes(language)) {
                return vscode.window.showErrorMessage(`No documentation found for ${language}!`);
            }

            const languages = {
                "javascript": {
                    "classic": "https://discord.js.org/#/docs/main/stable/general/welcome",
                    "search": "https://discord.js.org/#/docs/main/stable/search?q="
                },
                "python": {
                    "classic": "https://discordpy.readthedocs.io/en/latest/api.html",
                    "search": "https://discordpy.readthedocs.io/en/latest/search.html?q="
                },
                "typescript": {
                    "classic": "https://doc.deno.land/https/raw.githubusercontent.com/harmonyland/harmony/main/mod.ts",
                    "search": null
                },
                "java": {
                    "classic": "https://ci.dv8tion.net/job/JDA/javadoc/index.html",
                    "search": null
                }
            };

            const selection = editor.selection;
            // Get the word within the selection
            const textSelection = document.getText(selection);
            if (textSelection){
                // Get the good url
                const url = languages[language]["search"]
                if (url) {
                    // Open an url
                    return vscode.env.openExternal(vscode.Uri.parse(url + textSelection));
                } 
            }
            // Get the good url
            const url = languages[language]["classic"]
            // Open an url
            vscode.env.openExternal(vscode.Uri.parse(url));
        } 
	});
    context.subscriptions.push(openDiscordDoc);
}

// this method is called when your extension is deactivated
function deactivate() {}


// Exports
module.exports = {
    activate,
    deactivate
};