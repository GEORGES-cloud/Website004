# Recorta al centro, redimensiona, aplica el tratamiento monocromo tierra y recomprime.
# Lee photos/picks.json -> escribe photos/<hueco>.jpg con el aspecto exacto de su hueco.
#
# Tratamiento "monocromo tierra nordico" (ColorMatrix, reversible: los originales
# quedan en photos/candidates):
#   - conserva solo un 40% del croma original
#   - deriva ligera hacia calido (sube R, baja B)
#   - levanta los negros y baja los blancos: nada de negro ni blanco puros
param([string]$PicksFile = "photos\picks.json")   # cada entrada admite "out" y "size" opcionales
Add-Type -AssemblyName System.Drawing
$root = "C:\Users\Georges Barrio\Desktop\Luxor"

$TARGET = @{
  'hero-villa'    = @(900, 1020)
  'hero-equipo'   = @(900, 1020)
  'about-casa'    = @(1160, 798)
  'detalle-obra'  = @(870, 1160)
  'mantenimiento' = @(760, 1075)
  'limpieza'      = @(760, 1075)
  'reparaciones'  = @(760, 1075)
  'alquiler'      = @(760, 1075)
  'piscina'       = @(760, 1075)
  'reformas'      = @(760, 1075)
}

# --- matriz de color: desaturacion parcial + tinte calido + suavizado de extremos
# (PowerShell 5.1 no digiere literales de array anidados: se rellena celda a celda)
[double]$s  = 0.40               # croma conservado
[double]$k  = 0.94               # compresion de rango (blancos mas suaves)
[double]$lr = 0.299; [double]$lg = 0.587; [double]$lb = 0.114
$lum = @($lr, $lg, $lb)
$m = New-Object 'single[][]' 5
for ($i = 0; $i -lt 5; $i++) { $m[$i] = New-Object 'single[]' 5 }
for ($i = 0; $i -lt 3; $i++) {
  for ($j = 0; $j -lt 3; $j++) {
    $v = $lum[$i] * (1.0 - $s)
    if ($i -eq $j) { $v = $v + $s }
    $m[$i][$j] = [single]($v * $k)
  }
}
$m[3][3] = [single]1
$m[4][0] = [single]0.050; $m[4][1] = [single]0.038; $m[4][2] = [single]0.022; $m[4][4] = [single]1   # levanta negros, algo mas en R que en B
$cm = New-Object System.Drawing.Imaging.ColorMatrix -ArgumentList (,$m)
$ia = New-Object System.Drawing.Imaging.ImageAttributes
$ia.SetColorMatrix($cm)

# autotest: un gris medio debe salir mas calido (R > B) y un color puro debe perder croma
$t = New-Object System.Drawing.Bitmap(2,1); $t.SetPixel(0,0,[System.Drawing.Color]::FromArgb(128,128,128)); $t.SetPixel(1,0,[System.Drawing.Color]::FromArgb(40,90,200))
$t2 = New-Object System.Drawing.Bitmap(2,1); $gt = [System.Drawing.Graphics]::FromImage($t2)
$gt.DrawImage($t, (New-Object System.Drawing.Rectangle(0,0,2,1)), 0, 0, 2, 1, [System.Drawing.GraphicsUnit]::Pixel, $ia); $gt.Dispose()
$a = $t2.GetPixel(0,0); $b = $t2.GetPixel(1,0)
"autotest  gris 128 -> R$($a.R) G$($a.G) B$($a.B)   azul (40,90,200) -> R$($b.R) G$($b.G) B$($b.B)"
if (-not ($a.R -gt $a.B -and ($b.B - $b.R) -lt 100)) { throw "La matriz de color no hace lo esperado; abortando para no escribir fotos sin tratar." }
$t.Dispose(); $t2.Dispose()

$jpeg = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$prm  = New-Object System.Drawing.Imaging.EncoderParameters(1)
$prm.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 82)

$picks = Get-Content "$root\$PicksFile" -Raw | ConvertFrom-Json

foreach ($p in $picks) {
  $slot = $p.slot
  $outName = if ($p.PSObject.Properties['out'] -and $p.out) { $p.out } else { $slot }
  $src  = "$root\photos\candidates\$slot\$($p.file).jpg"
  if (-not (Test-Path $src)) { "FALTA  $slot -> $($p.file)"; continue }
  if ($p.PSObject.Properties['size'] -and $p.size) { $tw = [int]$p.size[0]; $th = [int]$p.size[1] }
  else { $tw = $TARGET[$slot][0]; $th = $TARGET[$slot][1] }

  $img = New-Object System.Drawing.Bitmap($src)
  $srcAsp = $img.Width / [double]$img.Height
  $dstAsp = $tw / [double]$th
  if ($srcAsp -gt $dstAsp) { $ch = $img.Height; $cw = [int]([Math]::Round($ch * $dstAsp)) }
  else                     { $cw = $img.Width;  $ch = [int]([Math]::Round($cw / $dstAsp)) }
  $cx = [int](($img.Width  - $cw) / 2)
  $cy = [int](($img.Height - $ch) / 2)

  $out = New-Object System.Drawing.Bitmap($tw, $th)
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'; $g.SmoothingMode = 'HighQuality'
  $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0,0,$tw,$th)), $cx, $cy, $cw, $ch, [System.Drawing.GraphicsUnit]::Pixel, $ia)
  $g.Dispose()
  $out.Save("$root\photos\$outName.jpg", $jpeg, $prm)
  $out.Dispose(); $img.Dispose()

  $kb = [int]((Get-Item "$root\photos\$outName.jpg").Length / 1KB)
  "{0,-14} {1}x{2}  {3} KB   <- [{4}] {5}" -f $outName, $tw, $th, $kb, $p.index, $p.file
}
$tot = (Get-ChildItem "$root\photos\*.jpg" | Measure-Object Length -Sum).Sum / 1KB
"TOTAL: {0} KB en {1} fotos" -f [int]$tot, (Get-ChildItem "$root\photos\*.jpg").Count
