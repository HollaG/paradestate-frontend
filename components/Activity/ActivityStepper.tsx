import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";


import makeStyles from "@mui/styles/makeStyles";


const HAStepper:React.FC<{step: 0|1|2}> = ({step}) => {
    const useStyles = makeStyles(() => ({
        root: {
            // "& .MuiStepIcon-completed": { color: "green" },
            // "& .Mui-disabled .MuiStepIcon-root": { color: "#319795" },
            "& .MuiStepLabel-label": {
                marginTop: "6px",
                "&.Mui-active": { fontWeight: "bold" },
            },
        },
    }));

    const c = useStyles();


    return (
        <Stepper
            activeStep={step}
            className={c.root}
            alternativeLabel
            sx={{ width: "100%", maxWidth: "700px" }}
        >
            <Step>
                <StepLabel sx={{ mt: 0 }}>Add activity</StepLabel>
            </Step>
            <Step>
                <StepLabel sx={{ mt: 0 }}>Add participants</StepLabel>
            </Step>
            <Step>
                <StepLabel sx={{ mt: 0 }}>Success</StepLabel>
            </Step>
        </Stepper>
    );
};

export default HAStepper;
