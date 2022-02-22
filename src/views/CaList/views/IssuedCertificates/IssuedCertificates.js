import { useTheme } from "@emotion/react"
import { Box, Grid, IconButton, LinearProgress, Paper, Typography } from "@mui/material"
import { LamassuChip } from "components/LamassuComponents/Chip"
import { LamassuTable } from "components/LamassuComponents/Table"
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

export const IssuedCertificates = ({refreshing, certificates}) => {
    const theme = useTheme()

    const certTableColumns = [
        {key: "serialNumber", title: "Serial Number", align: "start", size: 4},
        {key: "commonName", title: "Common Name", align: "center", size: 2},
        {key: "keyStrength", title: "Key Strength", align: "center", size: 1},
        {key: "certificateStatus", title: "Certificate Status", align: "center", size: 1},
        {key: "certificateExpiration", title: "Certificate Expiration", align: "center", size: 1},
        {key: "actions", title: "", align: "end", size: 2},

    ]

    const certificatesRenderer = certificates.map(cert => {
        return {
            serialNumber: <Typography style={{fontWeight: "700", fontSize: 13, color: theme.palette.text.primary}}>#{cert.serial_number}</Typography>,
            commonName: <Typography style={{fontWeight: "400", fontSize: 14, color: theme.palette.text.primary}}>{cert.subject.common_name}</Typography>,

            keyStrength: (
                <LamassuChip label={cert.key_metadata.strength} color={cert.key_metadata.strength_color}/>
            ), 
            certificateStatus:(
                <LamassuChip label={cert.status} color={cert.status_color}/>
            ), 
            certificateExpiration: <Typography style={{fontWeight: "400", fontSize: 14, color: theme.palette.text.primary}}>{cert.valid_to}</Typography>,
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Box component={Paper} elevation={0} style={{width: "fit-content", borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40}}>
                                <IconButton>
                                    <VisibilityIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box component={Paper} elevation={0} style={{width: "fit-content", borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40}}>
                                <IconButton>
                                    <FileDownloadRoundedIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Box component={Paper} elevation={0} style={{width: "fit-content", borderRadius: 8, background: theme.palette.background.lightContrast, width: 40, height: 40}}>
                                <IconButton>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            ),
        }
    })

    return(
        <>
            {
                refreshing == true && (
                    <Box sx={{width: "100%", height: "10px", marginBottom: "20px"}}>
                        <LinearProgress />
                    </Box>
                )

            }
            <LamassuTable columnConf={certTableColumns} data={certificatesRenderer} />
        </>
        
    )
}