import {DefaultColours} from "../theme/colours";

export const personalPageStyles = {
    container: {
        backgroundColor: DefaultColours.greyBackground,
        borderRadius: 4,
        paddingTop: 3,
        paddingBottom: 5,
        alignItems: "center",
        textAlign: "center",
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
    buttonContainer: {
        margin: 1,
    }
}
