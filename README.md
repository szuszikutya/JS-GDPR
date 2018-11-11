# JS-GDPR
Pure and minimalist JS based GDPR solution with no  dependency other JS library.
The script can runs on any mobile or desktop machine, and cookies are also
"protected".


# Configuration
- expire_day : data is stored in days
- gif_src : fade image location for popup window


## oWindow (popup window object)
- minWidth, maxWidth, minHeight, maxHeight : dimension limits of popup window
- widthScale, heightScale : how many percent of browser size should fill in
the popup window
- title : popup window title text
- text : popup window text
- footer : popup window footer text
- closeButton : popup window close button text

## options (popup window options)
Each element in this object represents selectable checkbox on the popup window.
The checkbox value will be stored it is on element name (example: IDs_1). You
must enter each element the following properties:
- text : text in popup window
- value : stored value
- enabled : element status. If false, the element will be not selectable.
Optionally, you can specify the element's call property, which is a function. It
will always be invited if the element is selected (like google or fb API call in
sample code).
