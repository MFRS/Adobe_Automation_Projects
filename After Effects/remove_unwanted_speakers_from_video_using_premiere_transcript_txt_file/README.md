# Adobe_Automation_Projects
 In order to be able to use this script, you will need:

 -Premiere Pro
 -After Effects
 -Visual Studio Code(with Adobe Script Runner extension installed)

 Step 1:

 Import your desired videos into Premiere and create a composition for each of them.

 Select Window>Text

 On Transcript, select transcribe sequence. Make sure you select the option that detects 
 different speakers.

 Considering you only want to keep one person speaking, after the transcription is complete, check the transcript, head to one of the times where your desired speaker is talking, then where it says "Speaker" and a number, click on it, then on Edit Speakers.

 Name your desired speaker. This will be important for the After effects script.

 Select the option Export to text file, and ensure your transcription has the same name as the video you're transcribing.

    Ensure you save your transcript inside a folder called "transcripts"

 Step 2:

 On main.jsx, where it says "Julia", change it to the name of the speaker you renamed in the Premiere transcript.

 The folder "auto_videos" will be the name of the folder in after effects that contains your videos. You will need to create it in your project and import your videos inside it.
 You're welcome to change the name.
 
 On class_main.jsx, you need to change the two vars in the beginning
this.path_automation_videos = "path"
this.path_automation_transcripts = "path"
where "path" is the path to the location of your videos and transcripts. Don't forget to add two \\ where there is only one \.

That's it
