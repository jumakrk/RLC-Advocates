Add-Type -AssemblyName System.Drawing

$imgDir = "C:\Users\JJ\Documents\RLC Advocates\Images"
$quality = 60 # Aggressive compression
$maxWidth = 800

# Get all images > 500KB
$images = Get-ChildItem -Path $imgDir -Include *.jpg, *.jpeg, *.png -Recurse | Where-Object { $_.Length -gt 500KB }

foreach ($file in $images) {
    try {
        Write-Host "Optimizing $($file.Name) ($([math]::Round($file.Length / 1MB, 2)) MB)..."
        
        $img = [System.Drawing.Image]::FromFile($file.FullName)
        
        # Determine new dimensions
        $newWidth = $img.Width
        $newHeight = $img.Height

        # Resize if width > maxWidth
        if ($img.Width -gt $maxWidth) {
            $newWidth = $maxWidth
            $newHeight = [int]($img.Height * ($maxWidth / $img.Width))
        }

        # Create new bitmap
        $resized = new-object System.Drawing.Bitmap $newWidth, $newHeight
        $graph = [System.Drawing.Graphics]::FromImage($resized)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
        
        # Dispose original to overwrite
        $img.Dispose()
        
        # Save config (JPEG Compression)
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
        
        # If original was PNG, we might convert to JPG for size, or just save as JPG extension to force compression
        # For simplicity, we save everything as .jpg in this pass if we want extreme savings, 
        # but rewriting the extension might break links. 
        # Let's save back to the original path. If it's PNG, this save might just save a PNG or fail with JPEG codec.
        # To be safe and simple for "Optimization": We will re-save as JPEG structure but keep filename if possible? 
        # No, let's strictly handle JPGs with the codec. 
        
        if ($file.Extension -match "\.png") {
            # For PNGs, we just resize (bitmaps are naturally smaller than huge raw) but true compression is harder in pure System.Drawing without format change.
            # We'll just save the resized version.
            $resized.Save($file.FullName) 
        } else {
            $resized.Save($file.FullName, $codec, $params)
        }

        $resized.Dispose()
        $graph.Dispose()
        
        $finalSize = (Get-Item $file.FullName).Length
        Write-Host " -> Done. New Size: $([math]::Round($finalSize / 1KB, 2)) KB"
        
    } catch {
        Write-Host "Error processing $($file.Name): $_"
    }
}
