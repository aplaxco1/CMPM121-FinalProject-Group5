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

# Devlog Entry 02 - 11/22/2023

## How We Satisfied Softwate Requirements [F0]

- [F0.a] You control a character moving on a 2D grid:

  Thus far in development, the player has control over a 2D sprite, which they can move in 4 different directions on the screen using the arrow keys. The game world is currently split up in a grid like
  pattern, where each grid cell is 30x30. The player's movement is not contained explicity to the bounds of each cell, as they can move in any way they wish with their limited 4 directional movement, as we
  wanted the player to have more direct control over their movements through the game world, the primary gardening mechanics themselves are restricted to this grid based pattern, and the player can only plant
  crops within the bounds of each grid cell. Though not required, we also have some directional walking and idle animations set up for the player, to give a bit more life to the scene rather then having a
  completely static controllable character. The controllable sprite we have now is only temporary, and we have the final spritesheet animations already set up, but we will implement this more polished version
  later on.
  
- [F0.b] You advance time in the turn-based simulation manually:

  Within our game, we have a "sleeping" mechanic, which allows the player to progress time forwards to the next day. In order to do this, the player can press the "S" key to progress to the next turn, which is
  when the new eather conditions for the next day are randomized, and how plants are enabled to grow over time. Rather than having a contsant update() loop to progress the game and change its state (aside from
  where the player chooses to plant crops), this mechanic serves to advance time within the game forwards in a sort of turn-based simulation whenever the player chooses to do so.
  
- [F0.c] You can reap (gather) or sow (plant) plants on the grid when your character is near them:

  As the player moves through the gird, the cell that they are currently standing within the bounds of is calculated and updated to reflect their current position. Based on what grid cell the player is standing
  on, if the player presses a key to "plant" one of their selection of crops (right now these are the "1", "2", and "3" keys on the keyboard), which will create a new crop within whatever grid cell they are
  within the bounds of. In order to "gather"/"harvest" these crops, if the player can press the "Space" key in order to remove a crop from the grid, if there currently exists a crop in the particular grid cell
  they are standing on. In order to store the information of which crop is placed in which grid cell, we are utilizing a map, which uses the numbered (row, collumn) grid cell as a key, and maps it to the newly
  created crop. When a player gathers a crop, its sprite will be removed from the scene and the grid cell will be set to null within the map. The crop will only count as "collected" and added to their inventory
  of crops if it was fully grown when the player harvested it.
  
- [F0.d] Grid cells have sun and water levels. The incoming sun and water for each cell is somehow randomly generated each turn. Sun energy cannot be stored in a cell (it is used immediately or lost)
  while water moisture can be slowly accumulated over several turns:

  For each grid cell in our game, they each have the same sun and water levels as generated each turn when the player chooses to "sleep". For this particular mechanic, when the player sleeps within the game,
  the sun level for the next day when they awaken is randomized to a new integer, while the water level is instead calculated based on a random chance of rain. If it rains when while the player sleeps and
  progresses to the next turn, there is a random chance of rain, which will set the water level to its highest for that day. As time progresses without rain, this water level will slowly decrease back down to
  its lowest value unless it rains again during that period of time. in tjis sense, the sun level is randomly selected each day, while the water level is randomly increased if a certain random event occurs and
  decrements over time as the rain water dries up.
  
- [F0.e] Each plant on the grid has a type (e.g. one of 3 species) and a growth level (e.g. “level 1”, “level 2”, “level 3”):

  Within our game, we have a generic crop class which describes the crops growth, and contains functions to allow it to grow each time that the player sleeps. Based on which of the crops that the player decides
  to plant a crop in a particular grid cell, which, as of now includes strawberries, potatoes, and corn as the three different types of plants, specific data, like the crop name and growth conditions are passed
  to the newly created crop, which will influence the sprites that it uses to represent itself on the grid, and also determines whether or not the crop will be able to grow based on the weather conditions of the
  current turn. When these crop type specific conditions are met, its growth level will increase from level 1 to level 6, and the crop type specific sprite used to represent that crop will change to reflect
  this growth level.
  
- [F0.f] Simple spatial rules govern plant growth based on sun, water, and nearby plants (growth is unlocked by satisfying conditions):

  As we have it set up now, each turn, all of the crops currently on the grid will attempt to grow and increase their growth level. However, these crops will only grow if the generated sun level and water level
  of the crop's current grid cell meets the specific crop type's needed minimum numerical water and sun levels, though, as of now, each grid cell posseses the same global value of sun and water levels, as we
  though that best fit the theme of our game. If these conditions are not satisfied, then the plant will not be able to progress its growth, and its current sprite representation and growth level will remain
  stagnant, until the next turn that both of these conditions are correctly met. Of course, these requirements are different per crop type, so this means that some crops will likely end up growing fatser than
  others and will grow at different rates, depending upon their minimum necessary sun and water levels.
  
- [F0.g] A play scenario is completed when some condition is satisfied (e.g. at least X plants at growth level Y or above):

  Thus far in development, we have a temporary condition that needs to be satisfied in order for the player to complete the gameplay scenario, that being, to harvest five fully grown strawberries. When a player
  harvests crops, if this crop is fully grown, the overall count of how many of that particular crop type they have harvested increases, so in order to check if the player has satified the win condition, we
  check if the current count within their inventory for the particular plant has met the needed number. When the player does satisfy these conditions, they are given a "You win!" message and prompted to restart
  the game from the begining again. This logic is temporary for now, as we will likely change the particular conditions that the player needs to satisfy, and possibly add multiple conditions or stages of
  requirements to complete a play scenario.

## Reflection

Over the course of implementing each of the F0 requirements while we have decided to stick with utilizng the Phaser framework and the TypeScript language in the creation of this gardening game, we did encounter
a few issues regarding the ways in which we had initially set uo the project, and our expectations regarding the transition from using JavaScript to TypeScript in a Phaser project. As dependencies when using
TypeScript as compared to JavaScript work a bit differently, we did face a few complications with our initial expectations regarding how global variables fundtion. In past Phaser projects, when using 
JavaScript, we would simply define global variables in the main.js file, and those could be changed and accessed by any scene within the game, but global variables work much differently in TypeScript. Which impacted how we approached defining and altering variables used by different Phaser scenes and prefabs. In addition to this, we did also have to become more accustumed to the ways in which Phaser objects need
to be defined in TypeScript, as the specific types or variables need to be more specifically defined and maintained than they do in JavaScript. However, after becoming accustomed to these differences throughout
the course of fuffilling the F0 requirements, we found this engine still suitable to continue working with.

Besides some complications with getting adjusted to our game engine of choice, we also did move around some group member roles a bit, or at least, we naturally ended up taking on some different responsibilities
than originally planned. While we had both a design lead and art lead, we had originally planned on having our art lead take on most of the reponsibilities when it came to art asset creation and implementation,
but our design lead ended up creating all of the spritesheets, both temporary and final, for our player sprite and the spritesheet for the growth progression of each of our crops. In turn, our original art lead ended up creating much of the design documentation to outline our gameplay mechanics and structures. Our engine lead also ended up accounting for some of our tools lead's responsibilities while getting the engine set up for the group to use, while also enstablishing the framework to use the tools we chose to utilize. The engine lead also helped solve some issues regarding the tools utilized, specifically in regards to how the group was utilize github to create deployments of the game. So, we did end up having some role adjustments as we started getting some work done on the project and naturally started to settle
into roles that best fit the responsibilities we each wished to be accountable for.

Lastly, we have done a bit of re-evaluating on the scope of our game. Originally, we had proposed to do a upgrade system as a sort of unique feature that we wanted to implement, while also focusing a bit on our
visual style with polished pixel art. During this stage of the project, it took quite a bit of time to get the framework of the game and its basic mechanics all implemented, more than we had originally
anticipated. Even then, there are still a few more features that we wish to fine tune in the future, including having a few more specific spatial conditions outside of the sun and water levels that will
influence how players interact with the game, and also adjusting how the sun and water level calculations work, to perhaps make the water level in particular different per cell to add a bit more variety. So in
this case, we may want to rethink the idea of having additional mechanics like the proposed upgrade system, as it might take too much time to implement when we want to focus more on polshing up our already
existing mechanics. We are however, content with the progress of our visual assests, including the player and crop spritesheets and animations, so we are planning on continuing to create more of these assets to
even further develop the art and visuals of our game.
