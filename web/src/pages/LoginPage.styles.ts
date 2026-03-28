import {DefaultColours} from "../theme/colours.ts";

export const loginPageStyles = {
    container: {
        backgroundColor: DefaultColours.greyBackground,
        paddingTop: 3,
        paddingBottom: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    centreContainer: {
        minHeight: "98vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
        boxSizing: "border-box",
    },
    imgContainer: {
        display: "flex",
        justifyContent: "center",
        margin: 5,
    }
}
