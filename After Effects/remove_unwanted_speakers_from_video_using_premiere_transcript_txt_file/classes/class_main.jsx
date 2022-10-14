function class_main() {

    // Define the path to the videos you have and the transcripts
    this.path_automation_videos = "path"
    this.path_automation_transcripts = "path"

    // This ensures that when reading the Filename on a folder, 
    // you get the filename only without the \\
    this.getFilenameOnlyOnAFile = function (isPath, userPath, getNumbersOnly) {
        
        
        
        if (isPath == true) {
            var filename = userPath.toString().replace(/^.*[\\\/]/, '');
            // This stops you from getting %20 as spaces
            var resolvedFile = decodeURI(filename)
            // If you only want the numbers on the filename
            if (getNumbersOnly == true) {
                return this.getNumberOnlyOnAFile(filename);
            } else {

                return resolvedFile;
            }

        }


    }


    this.getNumberOnlyOnAFile = function (name) {
        try {
            var cutMp3fromFileName = name.split(".");
        } catch (err) {
        }
        var getOnlyNumbers = cutMp3fromFileName[0].replace(/[^\d.]/g, '');
        return getOnlyNumbers;
    }

    this.findItemByNameInProject = function (itemName) {
        for (i = 1; i < app.project.numItems + 1; i++) {
            currentItem = app.project.item(i).name;
            if (currentItem == itemName) {
                return i;
            }
        }
    }

    this.automation_small_1_get_Filename_without_extension = function (array_vars) {
        /* 0 pathToTextFile  */
        /* 1  character to divide*/
        return array_vars[0].toString().substring(0, array_vars[0].toString().lastIndexOf(array_vars[1])) || array_vars[0];

    }


    this.automation_1_remove_unwanted_speakers_from_video = function (array_vars) {
        /*
This script reads from txt file
and removes all unwanted speakers
using the premiere transcript
generator where it looks for
all speakers except the name
youre going to input*/
        // ! Need to create comp with video and pass to 1_2_1
        /* 0  nametoIgnore*/
        /* 1  folder to run script in AE*/
        app.beginUndoGroup("test");

        var nametoIgnore = array_vars[0];
        var name_folder_script_folderAE = array_vars[1];
        // Will store the transcript that matches the name of the video that is 
        // currently being processed in the loop
        var chosenTranscript = 0;
        // Will store the video that is 
        // currently being processed in the loop
        var currentItem = 0;
        // Sets the correct index to find the folder with the desired name
        var folder_videos = this.findItemByNameInProject(name_folder_script_folderAE);
        
                // Goes through each video inside the folder 
                for (i = 1; i <= app.project.items[t].numItems; i++) {
                    // This searches for the transcript that has the same name as the video
                    // that is currently being searched for
                    var array_filesInFolder = Folder(this.path_automation_transcripts).getFiles("*.*");
                    for (r = 0; r < array_filesInFolder.length; r++) {
                        var currentFileName = this.automation_small_1_get_Filename_without_extension([this.getFilenameOnlyOnAFile(true, array_filesInFolder[r], false), "."]);
                        var currentAEItemName = this.automation_small_1_get_Filename_without_extension([app.project.items[t].item(i).name, "."]);
                        if (currentFileName == currentAEItemName) {
                            chosenTranscript = array_filesInFolder[r];
                            currentItem = app.project.items[t].item(i);
                            break;
                        }
                    }
                    // This will add all marker times on an array where someone other than the desired speaker is talking
                    var array_timesToDelete = this.automation_1_1_1_read_txtFile([chosenTranscript,nametoIgnore]);
                    // Create a comp for the current video being processed
                    var mainComp = app.project.items.addComp(currentItem.name, currentItem.width, currentItem.height, 1, currentItem.duration, currentItem.frameRate);
                    mainComp.openInViewer();
                    // add the video being processed
                    mainComp.layers.add(currentItem);
                    this.automation_1_2_1_create_Markers_from_Array([array_timesToDelete, mainComp]);
                    this.automation_1_3_1_create_video_with_wanted_sections_only_from_comp([mainComp]);
                }
        app.endUndoGroup();

    }



    // this.automation_1_3_2_cut_unwanted_sections_from_video = function(array_vars){
    this.automation_1_3_1_create_video_with_wanted_sections_only_from_comp = function (array_vars) {
        app.beginUndoGroup("test");






        /* 0  comp*/
        var compFolder = app.project.items.addFolder(array_vars[0].name);
        /*This will generate an array of sections from the video 
        without any of the unwanted sections by reading the markers on the 
        comp*/
        for (i = 1; i <= array_vars[0].markerProperty.numKeys; i++) {
            // for(i=1;i<=2;i++){
            var currentKey = array_vars[0].markerProperty.keyValue(i);
            var currentTime = array_vars[0].markerProperty.keyTime(i);
            /* at the end you need to make the last bit
            go till the end*/

            array_vars[0].layer(1).outPoint = currentTime;
            var array_layersForPreComp = [];
            // To precompose, you need to add the layers for precomposition to an array
            var layerToPrecomp = 0;
            if (i != array_vars[0].markerProperty.numKeys) {

                array_vars[0].layer(1).duplicate();
                layerToPrecomp = 2;
            } else {
                layerToPrecomp = 1;
            }
            array_layersForPreComp.push(array_vars[0].layer(layerToPrecomp).index);
            newPrecomp = array_vars[0].layers.precompose(array_layersForPreComp, "precomp_" + array_vars[0].name + "_" + i, true);
            newPrecomp.openInViewer().setActive();
            newPrecomp.workAreaStart = newPrecomp.layer(1).inPoint; //in seconds
            newPrecomp.parentFolder = compFolder;

            finalDuration = newPrecomp.layer(1).outPoint - newPrecomp.layer(1).inPoint;
            newPrecomp.workAreaDuration = finalDuration; //in seconds
            app.executeCommand(app.findMenuCommandId("Trim Comp to Work Area"));
            var sel = app.project.selection;
            app.executeCommand(4);    // 4 = app.findMenuCommand("Close"); // across all versions, even CC2014
            if (i != 1) {
                array_vars[0].layer(layerToPrecomp).startTime = array_vars[0].layer(layerToPrecomp + 1).outPoint;
            }

            if (i != array_vars[0].markerProperty.numKeys) {
                array_vars[0].layer(1).inPoint = currentFormatToTime(currentKey.comment, array_vars[0].frameRate)
            }
        }
        array_vars[0].duration = array_vars[0].layer(1).outPoint;
        app.endUndoGroup();
    }


    this.automation_1_2_1_create_Markers_from_Array = function (array_vars) {
        app.beginUndoGroup("test");

        /* 0 array  */
        /* 1  comp*/
        /*This adds markers with a comment of their
        duration , as its easier to calculate it 
        later*/
        for (i = 0; i < array_vars[0].length; i++) {

            currentTime = array_vars[0][i].toString().split(" - ");
            var markerTitle = currentTime[1];
            var myMarker = new MarkerValue(markerTitle);
            array_vars[1].markerProperty.setValueAtTime(currentFormatToTime(currentTime[0], array_vars[1].frameRate), myMarker);
        }
        app.endUndoGroup();
    }

    this.automation_1_1_1_read_txtFile = function (array_vars) {
        /* 0 pathToText  */
        /* 1 nametoIgnore  */

        var pathToText = array_vars[0];
        var nameToIgnore = array_vars[1];
        var array_ignoredTimes = [];
        //  ! First, get all lines into an array without empty lines
        var array_txtClean = this.sametxtFile_getAllTxtLinesIntoAnArray([pathToText])
        this.automation_1_1_2_obtain_only_times_that_dont_have_name([array_txtClean, nameToIgnore, array_ignoredTimes]);
        return array_ignoredTimes;
    }




    this.automation_1_1_2_obtain_only_times_that_dont_have_name = function (parent_array_vars) {
        /* 0 array all Lines  */
        /* 1 name to ignore  */
        /* 2 array to store new times  */

        /*This checks if the name is not found.
        If not, it continues to check till the
        speaker is the name you defined as 1, when it does
        then the time range is defined for that line.*/
        var storedTime = 0;
        var finalTime = 0;
        var endTime = 0;
        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker = function (child_array_vars) {
            /* 0 current I  */
            /* 1  search forward bool*/
            /* 2  search backward bool */
            /* 3 search normal bool*/

            var currentI = child_array_vars[0];
            var searchForwardBool = child_array_vars[1];
            var searchBackwardBool = child_array_vars[2];
            var searchNormalBool = child_array_vars[3];
            var array_AllLines = parent_array_vars[0];
            var nameToIgnore = parent_array_vars[1];
            var array_newTimes = parent_array_vars[2];
            //* When searching backwards, if you're below the array length, 
            //* then store the start time and search forward skipping the 
            //* next speaker as this is only reached from searching with
            //* a speaker time in mind
            if (currentI < 0) {
                storedTime = "0:00:00:00";
                this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI + 6, true, false, false])
            }
            //* when searching forward, if youre searching with a speaker in mind, store the final time,
            //* otherwise, if speaking with julia in mind, do nothing and end the function
            if (currentI > array_AllLines.length) {
                if (searchForwardBool == true) {

                    endTime = array_AllLines[currentI - 4].split(" - ")[1];
                    finalTime = storedTime.toString() + " - " + endTime.toString();
                    array_newTimes.push(finalTime);
                } else if (searchNormalBool == true) {

                }
            }
            //* if you passed the min or max of the array length, then do nothing below this
            if (currentI < 0 || currentI > array_AllLines.length) {

            } else {
                //* store the current speaker 
                var currentSpeaker = array_AllLines[currentI];

                //* if the current speaker is Julia
                if (currentSpeaker == nameToIgnore) {
                    //* if were searching with speakers in mind, store the start time as the start time of julia,
                    //* then run the function searching with normal bool true
                    if (searchForwardBool == true) {
                        endTime = array_AllLines[currentI - 1].split(" - ")[0];
                        finalTime = storedTime.toString() + " - " + endTime.toString();
                        array_newTimes.push(finalTime);
                        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI + 3, false, false, true]);
                        //* if were searching with speakers in mind, store the end time as the start time of julia,
                        //* then run the function searching with forward bool true
                    } else if (searchBackwardBool == true) {
                        storedTime = array_AllLines[currentI - 1].split(" - ")[1];
                        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI + 6, true, false, false]);
                        // * if searching with no one in mind, continue searching the same way with normal true
                    } else if (searchNormalBool == true) {
                        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI + 3, false, false, true]);
                    }
                    // * if a speaker is found
                } else {
                    // * if searching forward, keep searching forward
                    if (searchForwardBool == true) {
                        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI + 3, true, false, false]);
                        // * if searching with no one in mind and speaker found, then search backwards to find start time
                    } else if (searchNormalBool == true) {
                        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([currentI - 3, false, true, false]);
                    }
                }

            }


        }
        // * first time recursive function is called, you search with normal bool true, and with currentI 1,
        // * as its the location of the first speaker's name
        this.automation_1_1_2_2_snap_end_times_to_start_time_of_different_speaker([1, false, false, true]);

    }







    this.sametxtFile_getAllTxtLinesIntoAnArray = function (array_vars) {
        /* 0 pathToText  */
        var array_Lines = [];
        userFile = File(array_vars[0]);
        userFile.open("r");
        while (!userFile.eof) {
            currentLine = userFile.readln();
            // ! This ignores empty lines
            if (currentLine == "") {

            } else {
                array_Lines.push(currentLine);
            }

        }
        userFile.close();

        return array_Lines;

    }

}
