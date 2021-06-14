import { Box, Button, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Switch, TextField } from "@material-ui/core";
import { useEffect, useRef, useState } from "react";
import { LamassuModal } from "./LamassuModal";
import { MenuSeparator } from "views/Dashboard/SidebarMenuItem";
  
const LamassuModalDmsCreation = ({open, handleClose, handleSubmitViaForm, handleSubmitViaCsr}) => {
    const inputFileRef = useRef(null);

    const [isCsr, setIsCsr] = useState(false)
    const [csr, setCsr] = useState("")
    const [dmsName, setDmsName] = useState("")
    const [country, setCountry] = useState("")
    const [state, setState] = useState("")
    const [city, setCity] = useState("")
    const [org, setOrg] = useState("")
    const [orgUnit, setOrgUnit] = useState("")
    const [cn, setCN] = useState("")
    const [keyType, setKeyType] = useState("rsa")
    const [keyBits, setKeyBits] = useState(4096)

    const onFileChange = (e) => {
        /*Selected files data can be collected here.*/
        var files = e.target.files
        if (files.length > 0) {
            var reader = new FileReader();
            reader.readAsText(files[0], "UTF-8");
            reader.onload = (evt) => {
                var content = evt.target.result;
                setCsr(content)
            }
        }else{
            console.log("Nofile");
        }
        inputFileRef.current.value = ""
    }

    useEffect(()=>{
        if (keyType == "rsa") {
            setKeyBits(4096)
        }else{
            setKeyBits(384)
        }
    }, [keyType])

    const rsaOptions = [
        {
            label: "1024 (low)",
            value: 1024
        },
        {
            label: "2048 (medium)",
            value: 2048
        },
        {
            label: "3072 (high)",
            value: 3072
        },
        {
            label: "4096 (high)",
            value: 4096
        },
    ]

    const ecdsaOptions = [
        {
            label: "160 (low)",
            value: 160
        },
        {
            label: "224 (medium)",
            value: 224
        },
        {
            label: "256 (high)",
            value: 256
        },
        {
            label: "384 (high)",
            value: 384
        },
    ]

    const keyBitsOptions = keyType == "rsa" ? rsaOptions : ecdsaOptions

    return (
        <LamassuModal 
        
            title={"Creating new Device Manufacturing System"}
            msg={"To create a new DMS, please provide the apropiate information"}
            open={open}
            handleClose={handleClose}
            actions={
                [
                    {
                        title: "Create DMS",
                        primary: true,
                        onClick: ()=>{
                            if(isCsr){
                                handleSubmitViaCsr(dmsName, csr)
                            }else{
                                handleSubmitViaForm(dmsName, {
                                    keyBits: keyBits,
                                    keyType: keyType,
                                    country: country,
                                    state: state,
                                    locality: city,
                                    organization: org,
                                    organizationUnit: orgUnit,
                                    commonName: cn,
                                })
                            }
                        }
                    }
                ]
            }
            formContent={
                <Box>
                    <FormControlLabel
                        control={
                            <Switch
                            checked={isCsr}
                            onChange={()=>setIsCsr(!isCsr)}
                            color="primary"
                            />
                        }
                        label="Use CSR"
                    />
                    <TextField autoFocus margin="dense" id="dmsName" label="Device manufacturing system name" fullWidth value={dmsName} onChange={(ev)=>{setDmsName(ev.target.value)}} />
                    {
                        !isCsr ? (
                            <>
                                <TextField autoFocus margin="dense" id="country" label="Country" fullWidth value={country} onChange={(ev)=>{setCountry(ev.target.value)}} />
                                <TextField margin="dense" id="state" label="State/Province" fullWidth value={state} onChange={ev=>{setState(ev.target.value)}}/>
                                <TextField margin="dense" id="city" label="City" fullWidth value={city} onChange={ev=>{setCity(ev.target.value)}}/>
                                <TextField margin="dense" id="org" label="Organization" fullWidth value={org} onChange={ev=>{setOrg(ev.target.value)}}/>
                                <TextField margin="dense" id="orgUnit" label="Organization Unit" fullWidth value={orgUnit} onChange={ev=>{setOrgUnit(ev.target.value)}}/>
                                <TextField margin="dense" id="cn" label="Common Name" fullWidth value={cn} onChange={ev=>{setCN(ev.target.value)}}/>
                                <Grid container justify="space-between" alignItems="center">
                                    <FormControl style={{width: 235}}>
                                        <InputLabel id="key-type-label">Key Type</InputLabel>
                                        <Select
                                            labelId="key-type-label"
                                            value={keyType}
                                            onChange={ev=>{setKeyType(ev.target.value)}}
                                            autoWidth={false}
                                            fullWidth
                                        >
                                            <MenuItem value="rsa">RSA</MenuItem>
                                            <MenuItem value="ec">ECDSA</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl style={{width: 235}}>
                                        <InputLabel id="key-type-label">Key Bits</InputLabel>
                                        <Select
                                            labelId="key-bits-label"
                                            value={keyBits}
                                            onChange={ev=>{setKeyBits(ev.target.value)}}
                                            autoWidth={false}
                                            fullWidth
                                        >
                                        {
                                            keyBitsOptions.map(option =><MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)
                                        }
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        ) : (
                            <Box style={{marginTop: 10}}>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    onClick={()=>{inputFileRef.current.click() }}
                                >
                                    Select CSR file
                                </Button>
                                <input
                                    type="file"
                                    ref={inputFileRef}
                                    hidden
                                    onChange={(ev)=>onFileChange(ev)}
                                />
                                <Box container style={{margin: 20}}>
                                    <MenuSeparator/>
                                </Box>
                                <TextField
                                    id="standard-multiline-flexible"
                                    label="CSR content"
                                    multiline
                                    rows={18}
                                    style={{width: 500}}
                                    inputProps={{style: {fontSize: 12, fontFamily: "monospace"}}}
                                    variant="outlined"
                                    fullWidth
                                    value={csr}
                                    onChange={(ev)=>{setCsr(ev.target.value)}}
                                />
                            </Box>
                        )
                    }
                </Box>
            }
        />
    )
}

export {LamassuModalDmsCreation}
