# Devlog Entry 01 - 11/18/2023


## Introducing the Team

**Kayla Garcia** - Design Lead

Reponsibilities:
- Establish creative direction of the project.
- Create relevant art assets.
- Lead discussions on design and feel of the project.

**Harrison Le** - Tools Lead

Responsibilities:
- Identify tools needed to configure the project.
- Research new tools that may be needed to meet new challenges.
- Manage tools for code style consistency and project deploymnet.

**Christian Perez** - Testing Lead

Responsibilities:
- Write and test neccessary code.
- Produce testing guidlines and maintain a consistent working version of the project.
- Identify and fix bugs that arise within the program. 

**Autumn Plaxco** - Engine Lead

Responsibilities:
- Maintain the game engine of choice and research new engines to meet challenges.
- Establish standards for code organization and management.
- Produce code examples and propose software design.

**Dongling Yang (Ada)** - Art Lead

Responsibilities:
- Create majority of art assets needed for the project.
- Create necessray data files for implementing animations.
- Outline game mechanics as related to project's art style and visual format.


## Tools and Materials

In developing our project, we have decided to utilize the JavaScript library/framework, Phaser 3, as our primary game engine. The platform we intend for our game to be run in is 
web browsers, as the Phaser engine is used primarily to create HTML5 games. The main reason we decided to implement our project using Phaser is because everyone on our team is already 
familiar with it, and have previously utilized it to create small web-based games. The fact that we are all already experienced with using Phaser will enable up to delve more quickly 
into implementing the mechanics of our game, and test out individual components of it, rather than spending the majority of our time trying to learn new tools that we may have never 
interacted with before. Further into our game's development, if we find that we may want to implement new mechanics or features into our game, it will be easy for us to integrate
any new JavaScript libraries that might benefit our project by using Node.js.

Rather than using JavaScript, which is what the Phaser library was originally created to be utilized alongside, we will primarily be utilizing TypeScript. We've decided to utilize
TypeScript over traditional Javascript because we have found that, for a multitude of reasons, it helps to make collaboration between team members a bit easier. Because TypeScript implements
a more explicit type system, this will make it much easier for us to communicate the purpose of different sections of our code, so that we can better understand what each variable for each class
and scenes within our game ought to be used for. TypeScript also allows for the usage of interfaces, which will be particularly useful for us to utilize within this particular project,
as it will let us create different types of game objects with similar game mechanics and variables. Overall, we have found it to be a much more organized and manageable programming language as
compared to vanilla JavaScript. As we are using TypeScript, this also means that we will likely use the JSON for data storage, as it is a very standard file format that works well with the
programming language, as well as HTML and CSS where applicable when designing the interface and look of the playable web page for our game.

One of the primary tools we will be utilizing in the development of our game is the code editor, VS Code. Again, we are familiar with utilizing the interface of VS Code from previous projects
and assignments that we have done, so we are confident in our abilities to continue utilizing VS Code for this project. This particular code editor has a multitude of features, including
terminal and git integration, as well as a multitude of extensions which makes it suitable for our development environment. In addition to this we will also use Vite as our primary bundler,
as we have used it before and it is a suitable means for us to run and test our code as we develop it, especially when it comes to the TypeScript language. For the sake of maintaining
consistent formatting and styling guidelines that we will each follow when writing code, we will also use ESLint and Prettier, as ESLint will allow us to create standard rules for us to follow
when programming, and Prettier will maintain a consistent code format. These two tools will be helpful in maintaining consistency and readability between each of our programmers. Besides these
programming tools, there are also several art-based tools that we will utilize for the visual aspects of our game. Our game will be in pixel style since it’s the best option when we are only 
allowed a limited time frame. Additionally, based on the previous experience, we have noticed that using Phaser and JSON can help us to easily make cool interactions and animation effects. 
So, we will be using Adobe Suite to make most of the image assets, and then to use JSON, and some Phaser tools, to apply these animations and interactions.  


## Outlook

One unique and interesting mechanic that we hope to implement within our game - that still maintains the requirements of the assignments, but seeks to go a bit beyond them - is a sort of
upgrade system, where the player has the ability to either buy or create upgrades (ex: different types of fertilizer for the plants), which will help their plants grow at a much 
faster rate to accomplish the necessary goals faster. If we are to do this, we might also implement a sort of buying/selling system, where the player can sell the plants that they grow,
if they so choose, and then use the money that they make in order to buy upgrades that they can use on their plants. We believe that adding this extra layer into our game will make it
a bit more interesting and strategic for how players may want to go about managing their garden, and choosing when they want to upgrade their abilities. In addition to this, we also hope to
create a game with a unique and interesting visual style using pixel-based artwork. We hope to create tiles for the grid in the game with a nice visual style and potentially even with short
animations to bring more life and visual style into our game beyond just its programmed aspects.

The hardest part of this project, we imagine, will getting the base program structured and implemented in such a way that it will be easily iterable and adjusted when new requirements are 
added later on in the development cycle. Getting the basic game structured and laid out will be a big hurdle early on into creating this game, especially in regards to keeping it consistent 
between each of our programmers so that we all understand each aspect and can work with and expand one another's code. It will certainly be challenging to do all of this while also trying to 
make sure that the code is structured loosely enough that it will be easy for us to implement new features later on without needing to completely rework the way that the game already functions. 
Given our hopes for the additional features we want to include, it will also be difficult for us to do so given the limited amount of time that we have to implement the basic structure of the game
and the nature of complications that arise when working on code between multiple different people with their own approaches to programming.

By approaching this project with the tools that we have selected, we are hoping to collaborate on creating a game that utilizes TypeScript and Phaser in a much more structured and complex way. 
While we have experience with using Phaser and JavaScript together, we are hoping to learn how the process might differ when instead using TypeScript instead, and what sorts of benefits it offers over
traditional JavaScript. We are also hoping to combine the knowledge that we have previously gained by using Phaser and our newfound knowledge of more advanced programming tools and development patterns, 
so to create a project in a way that expands upon our past experiences by utilizing more complex tools and structures. In addition to this, we are also hoping to gain more experience of programming collaboratively, 
and to learn the best practices of managing various game factors while keeping the code readable and flexible between group members. Lastly, in a more general sense, we wish to gain a deeper understanding 
of game development in a team environment.












