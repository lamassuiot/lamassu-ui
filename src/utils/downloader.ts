const download = (filename: string, content: string) => {
    // creating an invisible element
    const element = document.createElement("a");
    element.setAttribute("href",
        "data:text/plain;charset=utf-8," +
    encodeURIComponent(content));
    element.setAttribute("download", filename);

    // Above code is equivalent to
    // <a href="path of file" download="file name">

    document.body.appendChild(element);

    // onClick property
    element.click();

    document.body.removeChild(element);
};

export default download;
