import {DefaultColours} from "../theme/colours.ts";

export const loginPageStyles = {
    container: {
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: 4,
        paddingTop: 3,
        paddingBottom: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    centreContainer: {
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        backgroundImage: "url('/assets/images/Rent-a-Tech-backdrop.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
    },
    imgContainer: {
        display: "flex",
        justifyContent: "center",
        margin: 5,
    },
    buttonContainer: {
        marginTop: 2,
    },
    qrcodeContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 2
    }
}
