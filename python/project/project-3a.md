---
sidebar_position: 11
title: 🚀 3a -Very realistic Among Us Simulation
---



<details>
<summary>
🚀 What is Among Us? 
</summary>
Among Us is essentially an online multiplayer version of the party game wink murder, but set on a constantly malfunctioning spaceship.  you’re told whether you’re an <b>innocent crew member</b> or an <b>imposter</b>. 

Allowed to talk to each other for a limited time. During these discussions, the crew needs to try to work out the identity of the imposter(s) by reporting on which other players seem to have been <b>acting suspiciously</b> [^1]

</details>

[^1]: [Among Us: the Ultimate Party Game of the Paranoid Covid Era](https://www.theguardian.com/games/2020/sep/29/among-us-the-ultimate-party-game-of-the-covid-era#:~:text=Among%20Us%20is%20essentially%20an,crew%20member%20or%20an%20imposter.)

:::tip You were accused as the imposter
- Write in the chat your defense to convince the fleet that you are **not the imposter**!
- Try talking about Bruno -> This is the trick not to get ejected
- Try entering nothing -> It should just print `you: ` and not have the chat react
:::


<PistonRunner
  lang="python"
  interactive={true}
  height="480px"
  code={`msg = input("Enter your defense: ")
print(f"you: {msg}")
if msg.strip():
    if "bruno" in msg.lower():
        print("purple: Wait, Bruno said they were in Electrical together. I trust them.")
    else:
        print("purple: That sounds sus. I still think it's you.")
`}
/>

:::tip Fix the following Program
- The following program doesn't ask for any user input. just prints whatver is inside of the variable <b>your_message</b> and your tag
- Modify line 4 so that it prompts user for an input and save it isnide of the "your_message" variable


<PistonRunner
  lang="python"
  interactive={true}
  height="480px"
  code={`# TODO: replace the hardcoded message with input()
your_message = "I was doing cards in Electrical with Bruno"
print(f"you: {your_message}")
if your_message.strip():
    if "bruno" in your_message.lower():
        print("purple: Wait, Bruno said they were in Electrical together. I trust them.")
    else:
        print("purple: That sounds sus. I still think it's you.")
`}
/>


<details>
<summary>
Hint
</summary>
Remember that to prompt an user to write input you write something like:

`inputvariable = input("Please enter somehting")`

</details>

:::


### Adding a Username



We are now going to modify the code so that it replicates the following behavior:

<PistonRunner
  lang="python"
  interactive={true}
  height="480px"
  code={`name = input("Username: ")
msg = input("Message: ")
print(f"{name}: {msg}")
if msg.strip():
    if "bruno" in msg.lower():
        print("cyan: Bruno can vouch for them — skip.")
    else:
        print("cyan: Not convinced. Vote?")
`}
/>

:::tip Add a username now too

- Expand the following block
- Modify `line 3` to request for a username
- Modify `line 6` to request for a message


<details>
<summary>
✍  You can solve the problem <b>here</b> using Piston
</summary>

<PistonRunner
  lang="python"
  interactive={true}
  height="480px"
  code={`# TODO: ask for a username (line 3) and a message (line 6)
username = "you"
your_message = "I swear I'm crew — ask Bruno"
print(f"{username}: {your_message}")
if your_message.strip():
    if "bruno" in your_message.lower():
        print("cyan: Bruno can vouch for them — skip.")
    else:
        print("cyan: Not convinced. Vote?")
`}
/>

</details>
:::

