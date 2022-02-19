import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

import makeStyles from "@mui/styles/makeStyles";

const CustomStepper: React.FC<{ step: 0 | 1 | 2; steps: string[] }> = ({
    step, steps
}) => {
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
            
            {steps.map((step, index) => (
                <Step key={index}>
                    <StepLabel sx={{ mt: 0 }}>{step}</StepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default CustomStepper;
