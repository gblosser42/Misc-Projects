# Exalted-Combat-Tracker

This is a command line application using node.js to track Exalted 3rd Edition Combat
Start the program with node tracker.js and then type help for a list of commands


*add			Adds a new actor to the combat. Takes in name, initiative, motes, maximum motes, willpower, health, defense and soak
*next		Moves to the next actor, listing their name(s) and the current tick.
			If no more actors remain, moves to the next turn and displays a list of all actors and initiative scores
*n			Alias for next
*set			Sets an actor's trait to a new value. Takes in name, attribute and new value.
*modify		Modifies an actor's trait by a given amount. Takes in name, attribute and value.
*wither		Inflicts withering damage on a target by a source. Transfers the taken initiative, and handles Crash.
			Takes in attacker, defender and amount
*withering	Alias for wither
*decisive	Inflicts decisive damage on a target by an attacker. Takes in attacker, defender,
			amount and the initiative to reset the attacker to
*remove		Removes an actor. Takes in name
*list		Lists all active actors and their initiative scores
*details		Lists all details about a specific actor. Takes in name
*undo		Undoes the last command. Can be called multiple times in a row
*redo		Redoes the last undone command. Can be called multiple times in a row
*help		Displays a list of all commands
*copy		Copies an actor with a new name and initiative. Takes in target, new name and initiative score
*save		Saves an actor to a file. Will append to the given file, or create it if necessary.
			Takes in name and an optional filepath. If name is all, saves all active actors
*load		Loads actors from a file. Takes in filename, and will prompt for initiative scores.
*exit		Exits the program